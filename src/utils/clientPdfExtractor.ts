import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { CyberCrimeDocument } from '../data/sampleDocument';
import { extractNcrpFromDigitalText } from './ncrpParser';

// Configure PDF.js worker with Vite bundling and CDN fallback
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      pdfjsWorker ||
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup note:', e);
  }
}

export interface ExtractedClientPdf {
  hasDigitalText: boolean;
  totalPages: number;
  fullText: string;
  pages: { num: number; text: string }[];
  parsedDoc?: CyberCrimeDocument;
}

/**
 * Extracts all text and page content directly in the browser preserving
 * line-by-line reading order and tabular column alignment using (x, y) coordinates.
 * Multi-tier fallback ensures it works on Vercel, localhost, and restricted corporate networks.
 */
export async function extractTextFromPdfInBrowser(file: File): Promise<ExtractedClientPdf> {
  const arrayBuffer = await file.arrayBuffer();
  let pdf: any = null;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableRange: true,
      disableStream: true,
      isEvalSupported: false,
    });
    pdf = await loadingTask.promise;
  } catch (err1) {
    console.warn('[PDF.js] Primary worker note, falling back to CDN worker:', err1);
    try {
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
      }
      const retryTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
        isEvalSupported: false,
      });
      pdf = await retryTask.promise;
    } catch (err2) {
      console.warn('[PDF.js] CDN worker note, falling back to workerless mode:', err2);
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      }
      const fallbackTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
        isEvalSupported: false,
      });
      pdf = await fallbackTask.promise;
    }
  }

  const totalPages = pdf.numPages;
  const pages: { num: number; text: string }[] = [];
  let fullText = '';

  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Group text items by line using vertical Y-coordinate with 3.5pt tolerance
      const lineTolerance = 3.5;
      const lines: { y: number; items: { x: number; str: string }[] }[] = [];

      for (const rawItem of textContent.items as any[]) {
        const str = (rawItem.str || '').trim();
        if (!str) continue;
        const x = rawItem.transform ? rawItem.transform[4] : 0;
        const y = rawItem.transform ? rawItem.transform[5] : 0;

        let line = lines.find((l) => Math.abs(l.y - y) <= lineTolerance);
        if (!line) {
          line = { y, items: [] };
          lines.push(line);
        }
        line.items.push({ x, str: rawItem.str.trim() });
      }

      // Sort lines top to bottom (in PDF coordinates, higher Y is higher on page)
      lines.sort((a, b) => b.y - a.y);

      // In each line, sort items left to right by X coordinate
      const lineStrings = lines.map((l) => {
        l.items.sort((a, b) => a.x - b.x);
        return l.items.map((it) => it.str).join('\t');
      });

      const pageText = lineStrings.join('\n');

      pages.push({ num: i, text: pageText });
      fullText += `\n--- PAGE ${i} OF ${totalPages} ---\n` + pageText;
    } catch (pageErr) {
      console.warn(`[Client PDF] Page ${i} extraction note:`, pageErr);
      pages.push({ num: i, text: '' });
    }
  }

  const trimmed = fullText.trim();
  const hasDigitalText = trimmed.length > 80;

  let parsedDoc: CyberCrimeDocument | undefined = undefined;
  if (hasDigitalText) {
    try {
      parsedDoc = extractNcrpFromDigitalText(fullText, pages);
    } catch (parseErr) {
      console.warn('[Client PDF] Deterministic parser note:', parseErr);
    }
  }

  return {
    hasDigitalText,
    totalPages,
    fullText,
    pages,
    parsedDoc,
  };
}
