import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { studyMaterials, extractedConcepts, conceptRelationships, conceptNotes } from "../../drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { extractTextFromFile } from "../utils/ocr";

/**
 * AI-Powered Concept Extraction Router
 * Automatically extracts key concepts, definitions, and relationships from study materials
 */

export const conceptExtractionRouter = router({
  /**
   * Upload and process study material for concept extraction
   */
  uploadMaterial: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      fileType: z.enum(['text', 'pdf', 'image', 'url']),
      fileUrl: z.string().optional(),
      textContent: z.string().optional(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      curriculum: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate that either fileUrl or textContent is provided
      if (!input.fileUrl && !input.textContent) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either fileUrl or textContent must be provided',
        });
      }

      // Create study material record
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [material] = await db.insert(studyMaterials).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        fileType: input.fileType,
        fileUrl: input.fileUrl,
        textContent: input.textContent,
        subject: input.subject,
        topic: input.topic,
        curriculum: input.curriculum,
        processingStatus: 'pending',
      });

      return {
        materialId: material.insertId,
        message: 'Material uploaded successfully. Processing will begin shortly.',
      };
    }),

  /**
   * Extract concepts from uploaded material using AI
   */
  extractConcepts: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get material
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [material] = await db.select().from(studyMaterials)
        .where(and(
          eq(studyMaterials.id, input.materialId),
          eq(studyMaterials.userId, ctx.user.id)
        ));

      if (!material) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Study material not found',
        });
      }

      // Update status to processing
      await db.update(studyMaterials)
        .set({ processingStatus: 'processing' })
        .where(eq(studyMaterials.id, input.materialId));

      try {
        // Get text content (for now, we'll use textContent directly)
        // In production, you would extract text from PDF/images here
        const textToAnalyze = material.textContent || '';

        if (!textToAnalyze) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No text content available for analysis',
          });
        }

        // Use AI to extract concepts
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are an expert educational content analyzer. Extract key concepts from study materials and provide structured information about each concept.

For each concept, provide:
1. Concept name (clear, concise title)
2. Definition (precise, academic definition)
3. Explanation (detailed explanation in simple terms)
4. Examples (2-3 practical examples)
5. Category (definition, formula, theorem, principle, or fact)
6. Importance score (0-100, how critical is this concept)
7. Difficulty level (beginner, intermediate, or advanced)
8. Keywords (related terms for search)

Also identify relationships between concepts:
- Prerequisite: concepts that must be learned first
- Related: concepts that are connected
- Opposite: contrasting concepts
- Example_of: specific instances of broader concepts
- Part_of: concepts that are components of larger concepts`,
            },
            {
              role: 'user',
              content: `Extract key concepts from the following study material:

Title: ${material.title}
Subject: ${material.subject || 'Not specified'}
Topic: ${material.topic || 'Not specified'}

Content:
${textToAnalyze}

Please extract all important concepts and their relationships.`,
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'concept_extraction',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  concepts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Concept name' },
                        definition: { type: 'string', description: 'Precise definition' },
                        explanation: { type: 'string', description: 'Detailed explanation' },
                        examples: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Practical examples',
                        },
                        category: {
                          type: 'string',
                          enum: ['definition', 'formula', 'theorem', 'principle', 'fact'],
                          description: 'Concept category',
                        },
                        importanceScore: {
                          type: 'integer',
                          description: 'Importance score 0-100',
                        },
                        difficulty: {
                          type: 'string',
                          enum: ['beginner', 'intermediate', 'advanced'],
                          description: 'Difficulty level',
                        },
                        keywords: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Related keywords',
                        },
                        position: {
                          type: 'integer',
                          description: 'Position in source material',
                        },
                      },
                      required: ['name', 'definition', 'explanation', 'examples', 'category', 'importanceScore', 'difficulty', 'keywords', 'position'],
                      additionalProperties: false,
                    },
                  },
                  relationships: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        conceptName: { type: 'string', description: 'Source concept name' },
                        relatedConceptName: { type: 'string', description: 'Related concept name' },
                        relationshipType: {
                          type: 'string',
                          enum: ['prerequisite', 'related', 'opposite', 'example_of', 'part_of'],
                          description: 'Type of relationship',
                        },
                        strength: {
                          type: 'integer',
                          description: 'Relationship strength 0-100',
                        },
                        description: { type: 'string', description: 'Relationship description' },
                      },
                      required: ['conceptName', 'relatedConceptName', 'relationshipType', 'strength', 'description'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['concepts', 'relationships'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const result = JSON.parse(typeof content === 'string' ? content : '{}');

        // Insert extracted concepts
        const conceptMap = new Map<string, number>();
        for (const concept of result.concepts) {
          const [insertedConcept] = await db.insert(extractedConcepts).values({
            materialId: input.materialId,
            conceptName: concept.name,
            definition: concept.definition,
            explanation: concept.explanation,
            examples: concept.examples,
            category: concept.category,
            importanceScore: concept.importanceScore,
            difficulty: concept.difficulty,
            keywords: concept.keywords,
            sourceContext: textToAnalyze.substring(
              Math.max(0, concept.position - 100),
              Math.min(textToAnalyze.length, concept.position + 100)
            ),
            position: concept.position,
          });

          conceptMap.set(concept.name, insertedConcept.insertId);
        }

        // Insert concept relationships
        for (const rel of result.relationships) {
          const conceptId = conceptMap.get(rel.conceptName);
          const relatedConceptId = conceptMap.get(rel.relatedConceptName);

          if (conceptId && relatedConceptId) {
            await db.insert(conceptRelationships).values({
              conceptId,
              relatedConceptId,
              relationshipType: rel.relationshipType,
              strength: rel.strength,
              description: rel.description,
            });
          }
        }

        // Update material status
        await db.update(studyMaterials)
          .set({
            processingStatus: 'completed',
            conceptCount: result.concepts.length,
            processedAt: new Date(),
          })
          .where(eq(studyMaterials.id, input.materialId));

        return {
          success: true,
          conceptCount: result.concepts.length,
          relationshipCount: result.relationships.length,
        };
      } catch (error) {
        // Update status to failed
        await db.update(studyMaterials)
          .set({ processingStatus: 'failed' })
          .where(eq(studyMaterials.id, input.materialId));

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to extract concepts',
          cause: error,
        });
      }
    }),

  /**
   * Get all study materials for current user
   */
  getMaterials: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const materials = await db.select().from(studyMaterials)
        .where(eq(studyMaterials.userId, ctx.user.id))
        .orderBy(desc(studyMaterials.uploadedAt));

      return materials;
    }),

  /**
   * Get concepts for a specific material
   */
  getConcepts: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify material belongs to user
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [material] = await db.select().from(studyMaterials)
        .where(and(
          eq(studyMaterials.id, input.materialId),
          eq(studyMaterials.userId, ctx.user.id)
        ));

      if (!material) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Study material not found',
        });
      }

      // Get concepts
      const concepts = await db.select().from(extractedConcepts)
        .where(eq(extractedConcepts.materialId, input.materialId))
        .orderBy(desc(extractedConcepts.importanceScore));

      return concepts;
    }),

  /**
   * Get relationships for a specific concept
   */
  getConceptRelationships: protectedProcedure
    .input(z.object({
      conceptId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Get relationships where this concept is the source
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const outgoingRels = await db.select().from(conceptRelationships)
        .where(eq(conceptRelationships.conceptId, input.conceptId));

      // Get relationships where this concept is the target
      const incomingRels = await db.select().from(conceptRelationships)
        .where(eq(conceptRelationships.relatedConceptId, input.conceptId));

      // Get related concept details
      const relatedConceptIds = [
        ...outgoingRels.map((r: any) => r.relatedConceptId),
        ...incomingRels.map((r: any) => r.conceptId),
      ];

      const relatedConcepts = await db.select().from(extractedConcepts)
        .where(eq(extractedConcepts.id, relatedConceptIds[0])); // Simplified for now

      return {
        outgoing: outgoingRels,
        incoming: incomingRels,
        relatedConcepts,
      };
    }),

  /**
   * Add a note to a concept
   */
  addConceptNote: protectedProcedure
    .input(z.object({
      conceptId: z.number(),
      noteText: z.string().min(1),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [note] = await db.insert(conceptNotes).values({
        userId: ctx.user.id,
        conceptId: input.conceptId,
        noteText: input.noteText,
        isPublic: input.isPublic,
      });

      return {
        noteId: note.insertId,
        message: 'Note added successfully',
      };
    }),

  /**
   * Get notes for a concept
   */
  getConceptNotes: protectedProcedure
    .input(z.object({
      conceptId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const notes = await db.select().from(conceptNotes)
        .where(and(
          eq(conceptNotes.conceptId, input.conceptId),
          eq(conceptNotes.userId, ctx.user.id)
        ))
        .orderBy(desc(conceptNotes.createdAt));

      return notes;
    }),

  /**
   * Upload PDF or image file with OCR text extraction
   */
  uploadFile: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      fileBase64: z.string(), // Base64 encoded file
      fileName: z.string(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      curriculum: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Decode base64 file
      const buffer = Buffer.from(input.fileBase64, 'base64');
      
      // Validate file size (16MB limit)
      if (buffer.length > 16 * 1024 * 1024) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File size exceeds 16MB limit',
        });
      }

      // Extract text using OCR
      const { text, fileType } = await extractTextFromFile(buffer);
      
      if (!text || text.trim().length < 50) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Could not extract sufficient text from file. Please ensure the file contains readable text.',
        });
      }

      // Upload file to S3
      const fileKey = `study-materials/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, buffer, fileType === 'pdf' ? 'application/pdf' : 'image/png');

      // Create study material record
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [material] = await db.insert(studyMaterials).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        fileType,
        fileUrl,
        textContent: text,
        subject: input.subject,
        topic: input.topic,
        curriculum: input.curriculum,
        processingStatus: 'pending',
      });

      return {
        materialId: material.insertId,
        extractedText: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        fileUrl,
        message: 'File uploaded and text extracted successfully. Processing will begin shortly.',
      };
    }),

  /**
   * Delete a study material and all its concepts
   */
  deleteMaterial: protectedProcedure
    .input(z.object({
      materialId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [material] = await db.select().from(studyMaterials)
        .where(and(
          eq(studyMaterials.id, input.materialId),
          eq(studyMaterials.userId, ctx.user.id)
        ));

      if (!material) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Study material not found',
        });
      }

      // Delete concepts (relationships and notes will be handled by cascade if configured)
      await db.delete(extractedConcepts)
        .where(eq(extractedConcepts.materialId, input.materialId));

      // Delete material
      await db.delete(studyMaterials)
        .where(eq(studyMaterials.id, input.materialId));

      return {
        success: true,
        message: 'Material deleted successfully',
      };
    }),
});
