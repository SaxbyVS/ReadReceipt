"use client";

import { useEffect, useMemo, useState } from "react";
import { Book, PercentProjectionRow, ProjectionMode, ProjectionRow } from "@/types";
import {
  DEFAULT_WPM,
  DEFAULT_WPP,
  generatePercentProjectionTable,
  generateProjectionTable,
  projectFromPercent,
  projectFromHours,
  projectFromPages,
} from "@/lib/projection";
import ProjectionControls from "./ProjectionControls";
import DownloadButtons from "./DownloadButtons";
import ReminderForm from "./ReminderForm";

interface ProjectionMapProps {
  book: Book;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectionMap({ book }: ProjectionMapProps) {
  const [mode, setMode] = useState<ProjectionMode>(() => {
    if (typeof window === "undefined") return "hours";
    try {
      const saved = JSON.parse(window.localStorage.getItem("readreceipt-defaults") ?? "{}");
      return saved.mode === "hours" || saved.mode === "pages" || saved.mode === "percent"
        ? saved.mode
        : "hours";
    } catch {
      return "hours";
    }
  });
  const [wpm, setWpm] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WPM;
    try {
      const saved = JSON.parse(window.localStorage.getItem("readreceipt-defaults") ?? "{}");
      return typeof saved.wpm === "number" ? saved.wpm : DEFAULT_WPM;
    } catch {
      return DEFAULT_WPM;
    }
  });
  const [wpp, setWpp] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WPP;
    try {
      const saved = JSON.parse(window.localStorage.getItem("readreceipt-defaults") ?? "{}");
      return typeof saved.wpp === "number" ? saved.wpp : DEFAULT_WPP;
    } catch {
      return DEFAULT_WPP;
    }
  });
  const [customHours, setCustomHours] = useState(1);
  const [customPages, setCustomPages] = useState(30);
  const [customPercent, setCustomPercent] = useState(5);
  const [manualPageCount, setManualPageCount] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    window.localStorage.setItem(
      "readreceipt-defaults",
      JSON.stringify({ wpm, wpp, mode })
    );
  }, [wpm, wpp, mode]);

  const parsedManualPageCount = manualPageCount ? parseInt(manualPageCount, 10) : null;
  const hasPageCountOverride =
    book.pageCount !== null &&
    parsedManualPageCount !== null &&
    parsedManualPageCount > 0 &&
    parsedManualPageCount !== book.pageCount;
  const totalPages = parsedManualPageCount && parsedManualPageCount > 0
    ? parsedManualPageCount
    : (book.pageCount ?? 0);
  const hasValidPages = totalPages > 0;
  const usePercentMode = !hasValidPages && mode === "percent";

  // Generate the default projection table
  const tableRows = useMemo(() => {
    if (!hasValidPages || usePercentMode) return [];
    return generateProjectionTable({
      totalPages,
      wordsPerMinute: wpm,
      wordsPerPage: wpp,
    });
  }, [totalPages, wpm, wpp, hasValidPages, usePercentMode]);

  const percentTableRows = useMemo(() => {
    if (!usePercentMode) return [];
    return generatePercentProjectionTable();
  }, [usePercentMode]);

  // Generate custom row
  const customRow = useMemo((): ProjectionRow | null => {
    if (!hasValidPages || usePercentMode) return null;
    if (mode === "hours") {
      return projectFromHours(totalPages, customHours, wpm, wpp);
    } else {
      return projectFromPages(totalPages, customPages, wpm, wpp);
    }
  }, [totalPages, mode, customHours, customPages, wpm, wpp, hasValidPages, usePercentMode]);

  const customPercentRow = useMemo((): PercentProjectionRow | null => {
    if (!usePercentMode) return null;
    return projectFromPercent(customPercent);
  }, [customPercent, usePercentMode]);

  // Combined rows for display and export
  const allRows = useMemo(() => {
    const rows = [...tableRows];
    if (customRow) {
      // Check if custom row already exists in default steps
      const exists = rows.some(
        (r) =>
          Math.abs(r.hoursPerDay - customRow.hoursPerDay) < 0.01 &&
          r.pagesPerDay === customRow.pagesPerDay
      );
      if (!exists) {
        rows.push(customRow);
        rows.sort((a, b) => a.hoursPerDay - b.hoursPerDay);
      }
    }
    return rows;
  }, [tableRows, customRow]);

  const allPercentRows = useMemo(() => {
    const rows = [...percentTableRows];
    if (customPercentRow) {
      const exists = rows.some((r) => r.percentPerDay === customPercentRow.percentPerDay);
      if (!exists) {
        rows.push(customPercentRow);
        rows.sort((a, b) => a.percentPerDay - b.percentPerDay);
      }
    }
    return rows;
  }, [percentTableRows, customPercentRow]);

  // Selected row for reminder (defaults to the custom row or 1 hour/day)
  const selectedRow = customRow ?? tableRows.find((r) => r.hoursPerDay === 1) ?? tableRows[0];

  async function copyPlanSummary() {
    if (!selectedRow) return;
    const summary = [
      `ReadReceipt plan for ${book.title}`,
      book.authors.length > 0 ? `Author: ${book.authors.join(", ")}` : null,
      `Pace: ${selectedRow.hoursPerDay}h/day (${selectedRow.pagesPerDay} pages/day)`,
      `Finish: ${formatDate(selectedRow.finishDate)}`,
      `Total reading time: ${selectedRow.totalHours} hours`,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(summary);
    setShareMessage("Plan summary copied.");
    window.setTimeout(() => setShareMessage(""), 2000);
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Section heading */}
      <div className="border-b-2 border-accent pb-2">
        <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-accent">
          {"// PROJECTION MAP"}
        </h2>
      </div>

      <ProjectionControls
        mode={mode}
        onModeChange={setMode}
        wpm={wpm}
        onWpmChange={setWpm}
        wpp={wpp}
        onWppChange={setWpp}
        customHours={customHours}
        onCustomHoursChange={setCustomHours}
        customPages={customPages}
        onCustomPagesChange={setCustomPages}
        customPercent={customPercent}
        onCustomPercentChange={setCustomPercent}
        manualPageCount={manualPageCount}
        onManualPageCountChange={setManualPageCount}
        onPageCountReset={() => setManualPageCount("")}
        defaultPageCount={book.pageCount}
        hasPageCount={!!book.pageCount}
      />

      {!hasValidPages && !usePercentMode ? (
        <div className="border-2 border-border bg-bg-surface p-6 text-center font-mono text-sm text-fg-muted uppercase tracking-wide">
          {"// Enter a page count above or switch to %/day mode to generate projections"}
        </div>
      ) : usePercentMode ? (
        <>
          <div className="border-[3px] border-border-hard">
            <div className="bg-bg-surface border-b-2 border-border-hard px-4 py-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-fg">
                PROJECTION TABLE - PERCENT OF BOOK PER DAY
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono" id="projection-table-percent">
                <thead>
                  <tr className="border-b-2 border-border-hard bg-bg-elevated">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      %/Day
                    </th>
                     <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                       Days to Finish
                     </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      Finish Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allPercentRows.map((row, i) => {
                    const isCustom = customPercentRow && row.percentPerDay === customPercentRow.percentPerDay;
                    return (
                      <tr
                        key={i}
                        className={`border-t border-border ${
                          isCustom
                            ? "bg-accent text-black font-bold"
                            : i % 2 === 0
                            ? "bg-bg-surface"
                            : "bg-bg"
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          {isCustom && <span className="mr-2">&gt;&gt;&gt;</span>}
                          {row.percentPerDay}%
                          {isCustom && (
                            <span className="ml-2 text-xs font-bold uppercase">YOUR PICK</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{row.daysToFinish} days</td>
                        <td className="px-4 py-2.5">{formatDate(row.finishDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs font-mono text-fg-muted uppercase tracking-wide">
            {"// percent/day mode works without a page count"}
          </p>
        </>
      ) : (
        <>
          {/* Projection Table — THE MAIN EVENT */}
          <div className="border-[3px] border-border-hard">
            {/* Table heading bar */}
            <div className="bg-bg-surface border-b-2 border-border-hard px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-fg">
                  PROJECTION TABLE — {totalPages.toLocaleString()} PAGES
                </h3>
                {hasPageCountOverride && (
                  <span className="border-2 border-accent bg-accent-dim px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                    Custom Page Count
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono" id="projection-table">
                <thead>
                  <tr className="border-b-2 border-border-hard bg-bg-elevated">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      Hours/Day
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      Pages/Day
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      Days to Finish
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-fg-muted">
                      Finish Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((row, i) => {
                    const isCustom =
                      customRow &&
                      Math.abs(row.hoursPerDay - customRow.hoursPerDay) < 0.01 &&
                      row.pagesPerDay === customRow.pagesPerDay;
                    return (
                      <tr
                        key={i}
                        className={`border-t border-border ${
                          isCustom
                            ? "bg-accent text-black font-bold"
                            : i % 2 === 0
                            ? "bg-bg-surface"
                            : "bg-bg"
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          {isCustom && (
                            <span className="mr-2">&gt;&gt;&gt;</span>
                          )}
                          {row.hoursPerDay}h
                          {isCustom && (
                            <span className="ml-2 text-xs font-bold uppercase">YOUR PICK</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{row.pagesPerDay}</td>
                        <td className="px-4 py-2.5">{row.daysToFinish} days ({row.totalHours}h total)</td>
                        <td className="px-4 py-2.5">{formatDate(row.finishDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs font-mono text-fg-muted uppercase tracking-wide">
            {`// ${wpm} wpm · ${wpp} words/page · start: today`}
          </p>

          {/* Download Buttons */}
          <DownloadButtons book={book} rows={allRows} customRow={customRow} wpm={wpm} wpp={wpp} totalPages={totalPages} />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyPlanSummary}
              className="border-2 border-border bg-bg-surface px-5 py-2 text-sm font-mono font-bold uppercase tracking-wider text-fg hover:border-accent hover:text-accent"
            >
              Copy Plan Summary
            </button>
            {shareMessage && <span className="text-sm font-mono text-accent">{shareMessage}</span>}
          </div>

          {/* Reminder Form */}
          {selectedRow && (
            <ReminderForm book={book} selectedRow={selectedRow} />
          )}
        </>
      )}
    </div>
  );
}
