#!/usr/bin/env node
// Standalone OCR test using Tesseract.js
// Usage: node scripts/ocr-test.js <imagePathOrURL>

import Tesseract from 'tesseract.js';

const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Usage: node scripts/ocr-test.js <imagePathOrURL>');
  process.exit(1);
}

function parseMedicinesFromText(text) {
  const lines = text
    .split(/\r?\n|\s{2,}/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = [];
  const dosageRegex = /(\d+\s?(mg|mcg|g|ml|iu))/i;
  const nameRegex = /\b([A-Z][a-zA-Z]{3,})\b/;

  for (const line of lines) {
    const dosageMatch = line.match(dosageRegex);
    const nameMatch = line.match(nameRegex);
    if (nameMatch && dosageMatch) {
      const name = nameMatch[1];
      const dosage = dosageMatch[1].replace(/\s+/g, '');
      candidates.push({ name, dosage });
    }
  }

  const unique = new Map();
  for (const c of candidates) {
    const key = `${c.name.toLowerCase()}_${(c.dosage || '').toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, c);
  }
  return Array.from(unique.values());
}

console.log(`[OCR] Recognizing: ${imagePath}`);
const start = Date.now();
Tesseract.recognize(imagePath, 'eng', { logger: (m) => m.status && process.stdout.write(`\r${m.status.padEnd(20)} ${Math.round((m.progress||0)*100)}%   `) })
  .then(({ data }) => {
    console.log('\n--- Raw Text ---');
    console.log(data.text);
    const meds = parseMedicinesFromText(data.text);
    console.log('\n--- Detected Medicines ---');
    if (meds.length === 0) {
      console.log('None');
    } else {
      meds.forEach((m) => console.log(`- ${m.name} ${m.dosage}`));
    }
    console.log(`\nDone in ${(Date.now()-start)/1000}s`);
  })
  .catch((err) => {
    console.error('\nOCR error:', err);
    process.exit(2);
  });



