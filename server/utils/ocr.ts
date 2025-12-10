import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
import { TRPCError } from '@trpc/server';

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Extract text from image buffer using Tesseract OCR
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  } finally {
    await worker.terminate();
  }
}

/**
 * Detect file type from buffer
 */
export function detectFileType(buffer: Buffer): 'pdf' | 'image' | 'unknown' {
  // Check PDF signature
  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
    return 'pdf';
  }
  
  // Check common image signatures
  const signatures = {
    png: Buffer.from([0x89, 0x50, 0x4E, 0x47]),
    jpg: Buffer.from([0xFF, 0xD8, 0xFF]),
    gif: Buffer.from([0x47, 0x49, 0x46]),
    bmp: Buffer.from([0x42, 0x4D]),
    webp: Buffer.from([0x52, 0x49, 0x46, 0x46]),
  };
  
  for (const [type, sig] of Object.entries(signatures)) {
    if (buffer.length >= sig.length && buffer.subarray(0, sig.length).equals(sig)) {
      return 'image';
    }
  }
  
  return 'unknown';
}

/**
 * Extract text from file buffer (auto-detects PDF or image)
 */
export async function extractTextFromFile(buffer: Buffer): Promise<{ text: string; fileType: 'pdf' | 'image' }> {
  const fileType = detectFileType(buffer);
  
  if (fileType === 'pdf') {
    const text = await extractTextFromPDF(buffer);
    return { text, fileType: 'pdf' };
  } else if (fileType === 'image') {
    const text = await extractTextFromImage(buffer);
    return { text, fileType: 'image' };
  } else {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Unsupported file type. Please upload a PDF or image file (PNG, JPG, GIF, BMP, WebP).',
    });
  }
}
