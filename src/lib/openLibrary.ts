import { Book, BookSearchResult } from "@/types";

const OL_BASE = "https://openlibrary.org";

// ─── Open Library API response shapes ───────────────────────

interface OLSearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
}

interface OLSearchResponse {
  numFound: number;
  docs: OLSearchDoc[];
}

interface OLWorkResponse {
  title: string;
  authors?: { author: { key: string } }[];
  covers?: number[];
  description?: string | { value: string };
}

interface OLEditionResponse {
  title: string;
  authors?: { key: string }[];
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  covers?: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  works?: { key: string }[];
}

interface OLAuthorResponse {
  name: string;
}

// ─── Helper ─────────────────────────────────────────────────

function getCoverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M"): string | null {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function pickIsbn(doc: OLSearchDoc): string | null {
  // Prefer ISBN-13 (starts with 978/979), fall back to ISBN-10
  const isbn13 = doc.isbn?.find((i) => i.length === 13);
  if (isbn13) return isbn13;
  const isbn10 = doc.isbn?.find((i) => i.length === 10);
  return isbn10 ?? doc.isbn?.[0] ?? null;
}

// ─── Search books ───────────────────────────────────────────

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const url = `${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);

  const data: OLSearchResponse = await res.json();

  return data.docs
    .map((doc) => {
      const isbn = pickIsbn(doc);
      if (!isbn) return null; // Skip books without any ISBN
      return {
        isbn,
        title: doc.title,
        authors: doc.author_name ?? [],
        coverUrl: getCoverUrl(doc.cover_i),
        firstPublishYear: doc.first_publish_year ?? null,
      };
    })
    .filter((b): b is BookSearchResult => b !== null);
}

// ─── Get book by ISBN ───────────────────────────────────────

export async function getBookByISBN(isbn: string): Promise<Book | null> {
  // Step 1: Fetch the edition by ISBN
  const editionRes = await fetch(`${OL_BASE}/isbn/${isbn}.json`);
  if (!editionRes.ok) return null;

  const edition: OLEditionResponse = await editionRes.json();

  // Step 2: Resolve author names
  const authorKeys = edition.authors?.map((a) => a.key) ?? [];
  const authorNames = await Promise.all(
    authorKeys.map(async (key) => {
      try {
        const res = await fetch(`${OL_BASE}${key}.json`);
        if (!res.ok) return "Unknown Author";
        const author: OLAuthorResponse = await res.json();
        return author.name;
      } catch {
        return "Unknown Author";
      }
    })
  );

  // Step 3: Try to get word count from the work (if available)
  let wordCount: number | null = null;
  if (edition.works?.[0]?.key) {
    try {
      const workRes = await fetch(`${OL_BASE}${edition.works[0].key}.json`);
      if (workRes.ok) {
        const work: OLWorkResponse = await workRes.json();
        // Open Library doesn't reliably provide word count in the API,
        // but we check in case it appears in extended fields.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workAny = work as any;
        if (typeof workAny.word_count === "number") {
          wordCount = workAny.word_count;
        }
      }
    } catch {
      // word count fetch is best-effort
    }
  }

  // Step 4: Estimate word count from page count if not available
  // Industry standard: ~250 words per page
  const pageCount = edition.number_of_pages ?? null;
  if (!wordCount && pageCount) {
    wordCount = pageCount * 250;
  }

  const finalIsbn =
    edition.isbn_13?.[0] ?? edition.isbn_10?.[0] ?? isbn;
  const coverId = edition.covers?.[0];

  return {
    isbn: finalIsbn,
    title: edition.title,
    authors: authorNames.length > 0 ? authorNames : ["Unknown Author"],
    pageCount,
    wordCount,
    publishDate: edition.publish_date ?? null,
    coverUrl: getCoverUrl(coverId, "L"),
  };
}
