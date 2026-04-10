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
  language?: string[];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface OLSearchByISBNResponse {
  numFound: number;
  docs: {
    key: string;
    number_of_pages_median?: number;
  }[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  eng: "English",
  ger: "German",
  fre: "French",
  spa: "Spanish",
  ita: "Italian",
  por: "Portuguese",
  dut: "Dutch",
  dan: "Danish",
  pol: "Polish",
  tur: "Turkish",
  jpn: "Japanese",
  kor: "Korean",
  chi: "Chinese",
  heb: "Hebrew",
  cat: "Catalan",
};

interface OLEditionResponse {
  key?: string;
  title: string;
  authors?: { key: string }[];
  languages?: { key: string }[];
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  pagination?: string;
  covers?: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  works?: { key: string }[];
}

interface OLAuthorResponse {
  name: string;
}

interface OLWorkEditionsResponse {
  entries?: OLEditionResponse[];
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

function normalizeText(value: string | undefined | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editionLanguageKeys(edition: OLEditionResponse): string[] {
  return edition.languages?.map((lang: { key: string }) => lang.key.split("/").pop() ?? "") ?? [];
}

function isEnglishEdition(edition: OLEditionResponse): boolean {
  return editionLanguageKeys(edition).includes("eng");
}

function getPrimaryLanguageLabel(edition: OLEditionResponse): string | null {
  const keys = editionLanguageKeys(edition);
  if (keys.length === 0) return null;
  const preferred = keys.includes("eng") ? "eng" : keys[0];
  return LANGUAGE_LABELS[preferred] ?? preferred.toUpperCase();
}

function hasUsablePageCount(edition: OLEditionResponse): boolean {
  return typeof edition.number_of_pages === "number" || typeof edition.pagination === "string";
}

function choosePreferredEdition(
  editions: OLEditionResponse[],
  preferredTitle?: string
): OLEditionResponse | null {
  if (editions.length === 0) return null;

  const targetTitle = normalizeText(preferredTitle);

  const scored = editions.map((edition) => {
    const editionTitle = normalizeText(edition.title);
    const exactTitleMatch = targetTitle.length > 0 && editionTitle === targetTitle;
    const closeTitleMatch =
      targetTitle.length > 0 &&
      (editionTitle.includes(targetTitle) || targetTitle.includes(editionTitle));

    let score = 0;
    if (isEnglishEdition(edition)) score += 100;
    if (exactTitleMatch) score += 40;
    else if (closeTitleMatch) score += 20;
    if (hasUsablePageCount(edition)) score += 10;
    if ((edition.covers?.length ?? 0) > 0) score += 5;
    if ((edition.isbn_13?.length ?? 0) > 0) score += 3;
    if ((edition.isbn_10?.length ?? 0) > 0) score += 1;

    return { edition, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.edition ?? null;
}

async function resolvePreferredEdition(
  workKey: string,
  preferredTitle?: string
): Promise<OLEditionResponse | null> {
  const res = await fetch(`${OL_BASE}${workKey}/editions.json?limit=200`);
  if (!res.ok) return null;

  const data: OLWorkEditionsResponse = await res.json();
  return choosePreferredEdition(data.entries ?? [], preferredTitle);
}

// ─── Search books ───────────────────────────────────────────

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const url = `${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,language`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);

  const data: OLSearchResponse = await res.json();

  return data.docs
    .map((doc) => {
      const isbn = pickIsbn(doc);
      if (!isbn) return null; // Skip books without any ISBN
      return {
        workKey: doc.key,
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

export async function getBookByISBN(
  isbn: string,
  options?: { workKey?: string; preferredTitle?: string }
): Promise<Book | null> {
  let edition: OLEditionResponse | null = null;

  if (options?.workKey) {
    try {
      edition = await resolvePreferredEdition(options.workKey, options.preferredTitle);
    } catch {
      edition = null;
    }
  }

  if (!edition) {
    const editionRes = await fetch(`${OL_BASE}/isbn/${isbn}.json`);
    if (!editionRes.ok) return null;
    edition = await editionRes.json();
  }

  if (!edition) return null;

  const resolvedEdition = edition;

  let work: OLWorkResponse | null = null;
  if (resolvedEdition.works?.[0]?.key) {
    try {
      const workRes = await fetch(`${OL_BASE}${resolvedEdition.works[0].key}.json`);
      if (workRes.ok) {
        work = await workRes.json();
      }
    } catch {
      work = null;
    }
  }

  // Step 2: Resolve author names
  const authorKeys =
    resolvedEdition.authors?.map((a) => a.key) ??
    work?.authors?.map((a) => a.author.key) ??
    [];
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

  // Step 3: Resolve page count with multiple fallbacks
  let pageCount: number | null = resolvedEdition.number_of_pages ?? null;

  // Fallback: parse the "pagination" field (e.g. "xxxiv, 671 p. ;")
  if (!pageCount && resolvedEdition.pagination) {
    const match = resolvedEdition.pagination.match(/(\d{2,})\s*p/);
    if (match) {
      pageCount = parseInt(match[1], 10);
    }
  }

  // Fallback: check the work for number_of_pages_median via search API
  if (!pageCount) {
    try {
      const searchRes = await fetch(
        `${OL_BASE}/search.json?isbn=${isbn}&fields=key,number_of_pages_median&limit=1`
      );
      if (searchRes.ok) {
        const searchData: OLSearchByISBNResponse = await searchRes.json();
        const median = searchData.docs?.[0]?.number_of_pages_median;
        if (typeof median === "number" && median > 0) {
          pageCount = median;
        }
      }
    } catch {
      // search fallback is best-effort
    }
  }

  // Step 4: Try to get word count from the work (if available)
  let wordCount: number | null = null;
  if (work && typeof work.word_count === "number") {
    wordCount = work.word_count;
  }

  // Step 5: Estimate word count from page count if not available
  // Industry standard: ~250 words per page
  if (!wordCount && pageCount) {
    wordCount = pageCount * 250;
  }

  const finalIsbn =
    resolvedEdition.isbn_13?.[0] ?? resolvedEdition.isbn_10?.[0] ?? isbn;
  const coverId = resolvedEdition.covers?.[0];

  // Build Open Library URL from the edition key
  const openLibraryUrl = resolvedEdition.key
    ? `${OL_BASE}${resolvedEdition.key}`
    : `${OL_BASE}/isbn/${finalIsbn}`;

  return {
    isbn: finalIsbn,
    title: resolvedEdition.title,
    authors: authorNames.length > 0 ? authorNames : ["Unknown Author"],
    source: "openlibrary",
    language: getPrimaryLanguageLabel(resolvedEdition),
    pageCount,
    wordCount,
    publishDate: resolvedEdition.publish_date ?? null,
    coverUrl: getCoverUrl(coverId, "L"),
    openLibraryUrl,
  };
}
