/**
 * Deterministic "receipt code" generator used to give each book a stable,
 * unique-looking order number and barcode pattern without introducing any
 * SSR/CSR hydration mismatch (no Math.random, no Date.now).
 *
 * Seeded from `book.isbn` (or title fallback) so the same book always renders
 * the same barcode.
 */

const BARCODE_BARS = 42;
const BARCODE_WIDTHS = [1, 1, 2, 2, 3, 4];

function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function formatOrderNumber(rng: () => number): string {
  const part = (len: number) => {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
    }
    return s;
  };
  return `${part(3)}-${part(3)}-${part(4)}`;
}

export interface ReceiptCode {
  orderNumber: string;
  barcodeWidths: number[];
}

export function receiptCodeFromIsbn(isbn: string | null | undefined, fallback = ""): ReceiptCode {
  const seedSource = (isbn && isbn.trim()) || fallback || "READRECEIPT";
  const rng = mulberry32(hashString(seedSource));

  const orderNumber = formatOrderNumber(rng);

  const barcodeWidths: number[] = [];
  for (let i = 0; i < BARCODE_BARS; i++) {
    barcodeWidths.push(BARCODE_WIDTHS[Math.floor(rng() * BARCODE_WIDTHS.length)]);
  }

  return { orderNumber, barcodeWidths };
}
