// @ts-ignore - No type definitions available
import AnkiExport from 'anki-apkg-export';

export interface ConceptCard {
  conceptName: string;
  definition: string | null;
  explanation: string | null;
  examples: string[] | null; // JSON array from database
  keywords: string[] | null; // JSON array from database
  category: string | null;
  difficulty: string | null;
  importanceScore: number | null;
}

/**
 * Generate Anki .apkg file from extracted concepts
 */
export async function generateAnkiDeck(
  deckName: string,
  concepts: ConceptCard[]
): Promise<Buffer> {
  const apkg = new AnkiExport(deckName);

  for (const concept of concepts) {
    // Front of card: Concept name + category
    const categoryEmoji = getCategoryEmoji(concept.category);
    const difficultyBadge = concept.difficulty ? `[${concept.difficulty.toUpperCase()}]` : '';
    
    const front = `
<div style="font-family: Arial, sans-serif; text-align: center;">
  <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
    ${categoryEmoji} ${concept.conceptName}
  </div>
  ${difficultyBadge ? `<div style="color: #666; font-size: 14px;">${difficultyBadge}</div>` : ''}
</div>
    `.trim();

    // Back of card: Definition + Explanation + Examples
    const back = `
<div style="font-family: Arial, sans-serif;">
  ${concept.definition ? `
    <div style="margin-bottom: 15px;">
      <strong style="color: #2563eb;">Definition:</strong>
      <p>${concept.definition}</p>
    </div>
  ` : ''}
  
  ${concept.explanation ? `
    <div style="margin-bottom: 15px;">
      <strong style="color: #7c3aed;">Explanation:</strong>
      <p>${concept.explanation}</p>
    </div>
  ` : ''}
  
  ${concept.examples && concept.examples.length > 0 ? `
    <div style="margin-bottom: 15px;">
      <strong style="color: #059669;">Examples:</strong>
      <ul style="margin-top: 5px;">
        ${concept.examples.map(ex => `<li>${ex}</li>`).join('')}
      </ul>
    </div>
  ` : ''}
  
  ${concept.keywords && concept.keywords.length > 0 ? `
    <div style="margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
      <strong style="color: #6b7280;">Keywords:</strong> ${concept.keywords.join(', ')}
    </div>
  ` : ''}
  
  ${concept.importanceScore !== null ? `
    <div style="margin-top: 10px; text-align: right; color: #9ca3af; font-size: 12px;">
      Importance: ${concept.importanceScore}/100
    </div>
  ` : ''}
</div>
    `.trim();

    // Add card to deck
    apkg.addCard(front, back);
  }

  // Generate and return the .apkg file as buffer
  const zipBuffer = await apkg.save();
  return Buffer.from(zipBuffer);
}

/**
 * Get emoji for concept category
 */
function getCategoryEmoji(category: string | null): string {
  switch (category) {
    case 'formula':
      return '🧮';
    case 'theorem':
      return '📐';
    case 'principle':
      return '⚡';
    case 'definition':
      return '📖';
    case 'fact':
      return '💡';
    default:
      return '📝';
  }
}

/**
 * Calculate spaced repetition intervals based on importance score
 * Returns initial interval in days
 */
export function calculateInitialInterval(importanceScore: number | null): number {
  if (importanceScore === null) return 1;
  
  // Higher importance = shorter initial interval (review sooner)
  if (importanceScore >= 80) return 1; // Review tomorrow
  if (importanceScore >= 60) return 3; // Review in 3 days
  if (importanceScore >= 40) return 7; // Review in 1 week
  return 14; // Review in 2 weeks
}
