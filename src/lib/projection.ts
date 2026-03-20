import { ProjectionRow, PercentProjectionRow } from "@/types";

// ─── Defaults ───────────────────────────────────────────────

export const DEFAULT_WPM = 250; // average adult reading speed
export const DEFAULT_WPP = 250; // average words per page (industry standard)

// ─── Default hour increments for the projection table ───────

export const DEFAULT_HOUR_STEPS = [0.5, 1, 1.5, 2, 3, 4, 6, 8];

// ─── Default percent steps for no-page-count projection ─────

export const DEFAULT_PERCENT_STEPS = [1, 2, 3, 5, 7, 10, 15, 20];

// ─── Core calculation ───────────────────────────────────────

interface ProjectionParams {
  totalPages: number;
  wordsPerMinute?: number;
  wordsPerPage?: number;
  startDate?: Date;
}

/**
 * Calculate pages read per hour given a reading speed.
 */
export function pagesPerHour(
  wpm: number = DEFAULT_WPM,
  wpp: number = DEFAULT_WPP
): number {
  // words per hour / words per page = pages per hour
  return (wpm * 60) / wpp;
}

/**
 * Generate the default projection table.
 * Returns a row for each hour-step in DEFAULT_HOUR_STEPS.
 */
export function generateProjectionTable(
  params: ProjectionParams
): ProjectionRow[] {
  const { totalPages, wordsPerMinute = DEFAULT_WPM, wordsPerPage = DEFAULT_WPP } = params;
  const startDate = params.startDate ?? new Date();

  const pph = pagesPerHour(wordsPerMinute, wordsPerPage);

  return DEFAULT_HOUR_STEPS.map((hours) => {
    const dailyPages = Math.round(pph * hours);
    const days = Math.max(1, Math.ceil(totalPages / dailyPages));
    const finish = new Date(startDate);
    finish.setDate(finish.getDate() + days);

    return {
      hoursPerDay: hours,
      pagesPerDay: dailyPages,
      daysToFinish: days,
      totalHours: Math.round(days * hours * 100) / 100,
      finishDate: finish.toISOString(),
    };
  });
}

/**
 * Calculate a single custom projection row from hours/day.
 */
export function projectFromHours(
  totalPages: number,
  hoursPerDay: number,
  wpm: number = DEFAULT_WPM,
  wpp: number = DEFAULT_WPP,
  startDate: Date = new Date()
): ProjectionRow {
  const pph = pagesPerHour(wpm, wpp);
  const dailyPages = Math.round(pph * hoursPerDay);
  const days = dailyPages > 0 ? Math.max(1, Math.ceil(totalPages / dailyPages)) : Infinity;
  const finish = new Date(startDate);
  if (isFinite(days)) {
    finish.setDate(finish.getDate() + days);
  }

  return {
    hoursPerDay,
    pagesPerDay: dailyPages,
    daysToFinish: isFinite(days) ? days : 0,
    totalHours: isFinite(days) ? Math.round(days * hoursPerDay * 100) / 100 : 0,
    finishDate: isFinite(days) ? finish.toISOString() : "",
  };
}

/**
 * Calculate a single custom projection row from pages/day.
 */
export function projectFromPages(
  totalPages: number,
  pagesPerDay: number,
  wpm: number = DEFAULT_WPM,
  wpp: number = DEFAULT_WPP,
  startDate: Date = new Date()
): ProjectionRow {
  const pph = pagesPerHour(wpm, wpp);
  const hoursPerDay = pph > 0 ? pagesPerDay / pph : 0;
  const days = pagesPerDay > 0 ? Math.max(1, Math.ceil(totalPages / pagesPerDay)) : Infinity;
  const finish = new Date(startDate);
  if (isFinite(days)) {
    finish.setDate(finish.getDate() + days);
  }

  return {
    hoursPerDay: Math.round(hoursPerDay * 100) / 100,
    pagesPerDay,
    daysToFinish: isFinite(days) ? days : 0,
    totalHours: isFinite(days) ? Math.round(days * hoursPerDay * 100) / 100 : 0,
    finishDate: isFinite(days) ? finish.toISOString() : "",
  };
}

// ─── Percent-based projections (no page count needed) ───────

/**
 * Generate the default percent-per-day projection table.
 * At X% per day, days = ceil(100 / X).
 */
export function generatePercentProjectionTable(
  startDate: Date = new Date()
): PercentProjectionRow[] {
  return DEFAULT_PERCENT_STEPS.map((pct) => {
    return projectFromPercent(pct, startDate);
  });
}

/**
 * Calculate a single projection row from percent-per-day.
 */
export function projectFromPercent(
  percentPerDay: number,
  startDate: Date = new Date()
): PercentProjectionRow {
  const days = percentPerDay > 0 ? Math.max(1, Math.ceil(100 / percentPerDay)) : Infinity;
  const finish = new Date(startDate);
  if (isFinite(days)) {
    finish.setDate(finish.getDate() + days);
  }

  return {
    percentPerDay,
    daysToFinish: isFinite(days) ? days : 0,
    finishDate: isFinite(days) ? finish.toISOString() : "",
  };
}
