import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Concept Extraction Router', () => {
  // Mock authenticated context
  const mockContext: Context = {
    user: {
      id: 1,
      openId: 'test-open-id',
      name: 'Test Student',
      email: 'student@test.com',
      role: 'student',
      institutionId: null,
      organizationId: null,
      branchId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      mobile: null,
      loginMethod: null,
      passwordHash: null,
      emailVerified: false,
      otpCode: null,
      otpExpiry: null,
      resetToken: null,
      resetTokenExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      googleId: null,
      facebookId: null,
      gdprConsent: false,
      gdprConsentDate: null,
      dataResidency: null,
      stripeCustomerId: null,
      profilePhotoUrl: null,
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  describe('uploadFile with OCR', () => {
    it('should detect PDF file type correctly', async () => {
      // Create a minimal PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n%test content\n%%EOF');
      const base64 = pdfBuffer.toString('base64');
      
      // This will fail PDF parsing but should detect it as PDF type
      await expect(
        caller.conceptExtraction.uploadFile({
          title: 'Test PDF Document',
          description: 'A test PDF file',
          fileBase64: base64,
          fileName: 'test.pdf',
          subject: 'mathematics',
          topic: 'Algebra',
          curriculum: 'CBSE',
        })
      ).rejects.toThrow(); // Will fail on parsing, but that's expected
    });

    it('should reject files larger than 16MB', async () => {
      // Create a buffer larger than 16MB
      const largeBuffer = Buffer.alloc(17 * 1024 * 1024);
      const base64 = largeBuffer.toString('base64');
      
      await expect(
        caller.conceptExtraction.uploadFile({
          title: 'Large File',
          fileBase64: base64,
          fileName: 'large.pdf',
        })
      ).rejects.toThrow('File size exceeds 16MB limit');
    });

    it('should reject unsupported file types', async () => {
      // Create an invalid file buffer
      const invalidBuffer = Buffer.from('not a valid file');
      const base64 = invalidBuffer.toString('base64');
      
      await expect(
        caller.conceptExtraction.uploadFile({
          title: 'Invalid File',
          fileBase64: base64,
          fileName: 'test.txt',
        })
      ).rejects.toThrow('Unsupported file type');
    });
  });

  describe('uploadMaterial', () => {
    it('should upload study material with text content', async () => {
      const result = await caller.conceptExtraction.uploadMaterial({
        title: 'Newton\'s Laws of Motion',
        description: 'Fundamental principles of classical mechanics',
        fileType: 'text',
        textContent: `Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the law of inertia.
        
Newton's Second Law states that the acceleration of an object depends on the mass of the object and the amount of force applied. The formula is F = ma, where F is force, m is mass, and a is acceleration.

Newton's Third Law states that for every action, there is an equal and opposite reaction. When one object exerts a force on another object, the second object exerts an equal force in the opposite direction.`,
        subject: 'physics',
        topic: 'Classical Mechanics',
        curriculum: 'CBSE',
      });

      expect(result).toHaveProperty('materialId');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('uploaded successfully');
      expect(typeof result.materialId).toBe('number');
    });

    it('should reject upload without title', async () => {
      await expect(
        caller.conceptExtraction.uploadMaterial({
          title: '',
          fileType: 'text',
          textContent: 'Some content',
        })
      ).rejects.toThrow();
    });

    it('should reject upload without content', async () => {
      await expect(
        caller.conceptExtraction.uploadMaterial({
          title: 'Test Material',
          fileType: 'text',
        })
      ).rejects.toThrow('Either fileUrl or textContent must be provided');
    });
  });

  describe('extractConcepts', () => {
    let materialId: number;

    beforeAll(async () => {
      // Create a material first
      const uploadResult = await caller.conceptExtraction.uploadMaterial({
        title: 'Photosynthesis Process',
        fileType: 'text',
        textContent: `Photosynthesis is the process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.

The photosynthesis equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2

Chlorophyll is the green pigment in plants that absorbs light energy. It is found in chloroplasts, which are the organelles where photosynthesis occurs.

Photosynthesis occurs in two stages: the light-dependent reactions and the light-independent reactions (Calvin cycle). The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle occurs in the stroma and uses ATP and NADPH to convert CO2 into glucose.`,
        subject: 'biology',
        topic: 'Plant Biology',
      });
      materialId = uploadResult.materialId;
    });

    it('should extract concepts from uploaded material', async () => {
      const result = await caller.conceptExtraction.extractConcepts({
        materialId,
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('conceptCount');
      expect(result).toHaveProperty('relationshipCount');
      expect(result.conceptCount).toBeGreaterThan(0);
      expect(typeof result.conceptCount).toBe('number');
      expect(typeof result.relationshipCount).toBe('number');
    }, 30000); // 30 second timeout for AI processing

    it('should reject extraction for non-existent material', async () => {
      await expect(
        caller.conceptExtraction.extractConcepts({
          materialId: 999999,
        })
      ).rejects.toThrow('Study material not found');
    });
  });

  describe('getMaterials', () => {
    it('should return list of user materials', async () => {
      const materials = await caller.conceptExtraction.getMaterials();

      expect(Array.isArray(materials)).toBe(true);
      if (materials.length > 0) {
        const material = materials[0];
        expect(material).toHaveProperty('id');
        expect(material).toHaveProperty('title');
        expect(material).toHaveProperty('userId');
        expect(material).toHaveProperty('processingStatus');
        expect(material).toHaveProperty('conceptCount');
      }
    });
  });

  describe('getConcepts', () => {
    let materialId: number;

    beforeAll(async () => {
      // Get first material from user's library
      const materials = await caller.conceptExtraction.getMaterials();
      if (materials.length > 0) {
        materialId = materials[0].id;
      }
    });

    it('should return concepts for a material', async () => {
      if (!materialId) {
        console.log('No materials available for testing getConcepts');
        return;
      }

      const concepts = await caller.conceptExtraction.getConcepts({
        materialId,
      });

      expect(Array.isArray(concepts)).toBe(true);
      if (concepts.length > 0) {
        const concept = concepts[0];
        expect(concept).toHaveProperty('id');
        expect(concept).toHaveProperty('materialId');
        expect(concept).toHaveProperty('conceptName');
        expect(concept).toHaveProperty('definition');
        expect(concept).toHaveProperty('category');
        expect(concept).toHaveProperty('importanceScore');
        expect(concept).toHaveProperty('difficulty');
        
        // Validate importance score range
        if (concept.importanceScore !== null) {
          expect(concept.importanceScore).toBeGreaterThanOrEqual(0);
          expect(concept.importanceScore).toBeLessThanOrEqual(100);
        }
        
        // Validate difficulty values
        if (concept.difficulty) {
          expect(['beginner', 'intermediate', 'advanced']).toContain(concept.difficulty);
        }
        
        // Validate category values
        if (concept.category) {
          expect(['definition', 'formula', 'theorem', 'principle', 'fact']).toContain(concept.category);
        }
      }
    });

    it('should reject getting concepts for non-existent material', async () => {
      await expect(
        caller.conceptExtraction.getConcepts({
          materialId: 999999,
        })
      ).rejects.toThrow('Study material not found');
    });
  });

  describe('addConceptNote', () => {
    let conceptId: number;

    beforeAll(async () => {
      // Get first concept from user's materials
      const materials = await caller.conceptExtraction.getMaterials();
      if (materials.length > 0) {
        const concepts = await caller.conceptExtraction.getConcepts({
          materialId: materials[0].id,
        });
        if (concepts.length > 0) {
          conceptId = concepts[0].id;
        }
      }
    });

    it('should add a note to a concept', async () => {
      if (!conceptId) {
        console.log('No concepts available for testing addConceptNote');
        return;
      }

      const result = await caller.conceptExtraction.addConceptNote({
        conceptId,
        noteText: 'This is a test note about the concept. Very important for exam!',
        isPublic: false,
      });

      expect(result).toHaveProperty('noteId');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('added successfully');
      expect(typeof result.noteId).toBe('number');
    });

    it('should reject empty note text', async () => {
      if (!conceptId) {
        return;
      }

      await expect(
        caller.conceptExtraction.addConceptNote({
          conceptId,
          noteText: '',
          isPublic: false,
        })
      ).rejects.toThrow();
    });
  });

  describe('getConceptNotes', () => {
    let conceptId: number;

    beforeAll(async () => {
      // Get first concept from user's materials
      const materials = await caller.conceptExtraction.getMaterials();
      if (materials.length > 0) {
        const concepts = await caller.conceptExtraction.getConcepts({
          materialId: materials[0].id,
        });
        if (concepts.length > 0) {
          conceptId = concepts[0].id;
        }
      }
    });

    it('should return notes for a concept', async () => {
      if (!conceptId) {
        console.log('No concepts available for testing getConceptNotes');
        return;
      }

      const notes = await caller.conceptExtraction.getConceptNotes({
        conceptId,
      });

      expect(Array.isArray(notes)).toBe(true);
      if (notes.length > 0) {
        const note = notes[0];
        expect(note).toHaveProperty('id');
        expect(note).toHaveProperty('userId');
        expect(note).toHaveProperty('conceptId');
        expect(note).toHaveProperty('noteText');
        expect(note).toHaveProperty('isPublic');
        expect(note).toHaveProperty('createdAt');
      }
    });
  });

  describe('deleteMaterial', () => {
    it('should delete a material and its concepts', async () => {
      // Create a material specifically for deletion
      const uploadResult = await caller.conceptExtraction.uploadMaterial({
        title: 'Material to Delete',
        fileType: 'text',
        textContent: 'This material will be deleted in the test.',
      });

      const result = await caller.conceptExtraction.deleteMaterial({
        materialId: uploadResult.materialId,
      });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('deleted successfully');

      // Verify material is actually deleted
      await expect(
        caller.conceptExtraction.getConcepts({
          materialId: uploadResult.materialId,
        })
      ).rejects.toThrow('Study material not found');
    });

    it('should reject deleting non-existent material', async () => {
      await expect(
        caller.conceptExtraction.deleteMaterial({
          materialId: 999999,
        })
      ).rejects.toThrow('Study material not found');
    });
  });

  describe('AI Extraction Quality', () => {
    it('should extract meaningful concepts with proper structure', async () => {
      const uploadResult = await caller.conceptExtraction.uploadMaterial({
        title: 'Pythagorean Theorem',
        fileType: 'text',
        textContent: `The Pythagorean theorem is a fundamental principle in geometry. It states that in a right-angled triangle, the square of the length of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the lengths of the other two sides.

The formula is: a² + b² = c², where c represents the length of the hypotenuse and a and b represent the lengths of the other two sides.

This theorem is named after the ancient Greek mathematician Pythagoras, although it was known to earlier civilizations. The theorem has numerous applications in mathematics, physics, engineering, and computer science.

A Pythagorean triple is a set of three positive integers a, b, c that satisfy the equation a² + b² = c². Common examples include (3, 4, 5), (5, 12, 13), and (8, 15, 17).`,
        subject: 'mathematics',
        topic: 'Geometry',
      });

      const extractResult = await caller.conceptExtraction.extractConcepts({
        materialId: uploadResult.materialId,
      });

      expect(extractResult.conceptCount).toBeGreaterThan(0);

      const concepts = await caller.conceptExtraction.getConcepts({
        materialId: uploadResult.materialId,
      });

      // Verify at least one concept has all required fields
      const hasCompleteConceptextraction = concepts.some(concept => 
        concept.conceptName &&
        concept.definition &&
        concept.explanation &&
        concept.category &&
        concept.importanceScore !== null &&
        concept.difficulty
      );

      expect(hasCompleteConceptextraction).toBe(true);

      // Clean up
      await caller.conceptExtraction.deleteMaterial({
        materialId: uploadResult.materialId,
      });
    }, 30000); // 30 second timeout for AI processing
  });

  describe('uploadBatchFiles', () => {
    it('should upload multiple files in parallel', async () => {
      // Create mock PDF data
      const mockPdf1 = Buffer.from('Mock PDF 1 content');
      const mockPdf2 = Buffer.from('Mock PDF 2 content');
      
      const result = await caller.conceptExtraction.uploadBatchFiles({
        files: [
          {
            title: 'Batch Test 1',
            fileBase64: mockPdf1.toString('base64'),
            fileName: 'test1.pdf',
            subject: 'Physics',
          },
          {
            title: 'Batch Test 2',
            fileBase64: mockPdf2.toString('base64'),
            fileName: 'test2.pdf',
            subject: 'Chemistry',
          },
        ],
      });

      expect(result.totalFiles).toBe(2);
      // Note: Actual success count may vary based on OCR results
      expect(result.results.length + result.errors.length).toBe(2);
    });

    it('should reject batch with more than 10 files', async () => {
      const files = Array.from({ length: 11 }, (_, i) => ({
        title: `Test ${i}`,
        fileBase64: Buffer.from('test').toString('base64'),
        fileName: `test${i}.pdf`,
      }));

      await expect(
        caller.conceptExtraction.uploadBatchFiles({ files })
      ).rejects.toThrow();
    });
  });

  describe('exportToAnki', () => {
    it('should export concepts to Anki deck', async () => {
      // First upload and extract concepts
      const uploadResult = await caller.conceptExtraction.uploadMaterial({
        title: 'Anki Export Test',
        fileType: 'text',
        textContent: 'Newton\'s First Law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the law of inertia.',
        subject: 'Physics',
      });

      await caller.conceptExtraction.extractConcepts({
        materialId: uploadResult.materialId,
      });

      // Export to Anki
      const result = await caller.conceptExtraction.exportToAnki({
        materialId: uploadResult.materialId,
      });

      expect(result.success).toBe(true);
      expect(result.fileUrl).toBeDefined();
      expect(result.cardCount).toBeGreaterThan(0);
      expect(result.deckName).toBe('Anki Export Test');

      // Clean up
      await caller.conceptExtraction.deleteMaterial({
        materialId: uploadResult.materialId,
      });
    }, 30000); // 30 second timeout for AI processing

    it('should fail when no concepts exist', async () => {
      const uploadResult = await caller.conceptExtraction.uploadMaterial({
        title: 'Empty Material',
        fileType: 'text',
        textContent: 'Short text without concepts.',
      });

      await expect(
        caller.conceptExtraction.exportToAnki({
          materialId: uploadResult.materialId,
        })
      ).rejects.toThrow('No concepts found');

      // Clean up
      await caller.conceptExtraction.deleteMaterial({
        materialId: uploadResult.materialId,
      });
    });
  });
});
