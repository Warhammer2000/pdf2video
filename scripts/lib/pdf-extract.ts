import * as fs from "node:fs";
import type { ExtractedPage } from "./types.js";

export async function extractText(
  pdfPath: string,
  pageNumbers: number[]
): Promise<ExtractedPage[]> {
  console.log(`\n[1/4] Extracting text from PDF: ${pdfPath}`);

  if (!fs.existsSync(pdfPath)) {
    console.error(`ERROR: PDF file not found: ${pdfPath}`);
    process.exit(1);
  }

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log(`  PDF loaded: ${doc.numPages} total pages.`);

  const pages: ExtractedPage[] = [];

  for (const pageNum of pageNumbers) {
    if (pageNum < 1 || pageNum > doc.numPages) {
      console.warn(`  WARNING: Page ${pageNum} out of range (1-${doc.numPages}), skipping.`);
      pages.push({ pageNumber: pageNum, text: "" });
      continue;
    }

    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .filter((item: any) => "str" in item)
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length === 0) {
      console.warn(`  WARNING: Page ${pageNum} has no extractable text.`);
    } else {
      console.log(`  Page ${pageNum}: ${text.length} chars extracted.`);
    }

    pages.push({ pageNumber: pageNum, text });
  }

  console.log(`  Extracted text from ${pages.length} pages.`);
  return pages;
}