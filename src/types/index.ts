// ─── Book Types ─────────────────────────────────────────────

export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  source?: "openlibrary" | "manual";
  language: string | null;
  pageCount: number | null;
  wordCount: number | null;
  publishDate: string | null;
  coverUrl: string | null;
  openLibraryUrl: string | null;
}

export interface BookSearchResult {
  workKey: string;
  isbn: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  firstPublishYear: number | null;
}

// ─── Projection Types ───────────────────────────────────────

export type ProjectionMode = "hours" | "pages" | "percent";

export interface ProjectionInput {
  totalPages: number;
  wordsPerMinute: number; // default 250
  wordsPerPage: number; // default 250
  mode: ProjectionMode;
  /** Used when mode is "hours" */
  hoursPerDay?: number;
  /** Used when mode is "pages" */
  pagesPerDay?: number;
}

export interface ProjectionRow {
  hoursPerDay: number;
  pagesPerDay: number;
  daysToFinish: number;
  totalHours: number;
  finishDate: string; // ISO date string
}

/** Percent-based projection row (no page count needed) */
export interface PercentProjectionRow {
  percentPerDay: number;
  daysToFinish: number;
  finishDate: string; // ISO date string
}

// ─── Reminder Types ─────────────────────────────────────────

export interface ReadingPlan {
  hoursPerDay?: number;
  pagesPerDay?: number;
  percentPerDay?: number;
  projectedFinishDate: string;
}

export interface Reminder {
  email: string;
  bookTitle: string;
  bookISBN: string;
  readingPlan: ReadingPlan;
  createdAt: Date;
  expiresAt: Date;
  lastSentAt: Date | null;
}

export interface CreateReminderPayload {
  email: string;
  bookTitle: string;
  bookISBN: string;
  readingPlan: ReadingPlan;
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
