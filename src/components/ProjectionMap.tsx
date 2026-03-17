"use client";

import { useState, useMemo } from "react";
import { Book, ProjectionMode, ProjectionRow } from "@/types";
import {
  DEFAULT_WPM,
  DEFAULT_WPP,
  generateProjectionTable,
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
  const [mode, setMode] = useState<ProjectionMode>("hours");
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [wpp, setWpp] = useState(DEFAULT_WPP);
  const [customHours, setCustomHours] = useState(1);
  const [customPages, setCustomPages] = useState(30);
  const [manualPageCount, setManualPageCount] = useState("");

  const totalPages = book.pageCount ?? (manualPageCount ? parseInt(manualPageCount, 10) : 0);
  const hasValidPages = totalPages > 0;

  // Generate the default projection table
  const tableRows = useMemo(() => {
    if (!hasValidPages) return [];
    return generateProjectionTable({
      totalPages,
      wordsPerMinute: wpm,
      wordsPerPage: wpp,
    });
  }, [totalPages, wpm, wpp, hasValidPages]);

  // Generate custom row
  const customRow = useMemo((): ProjectionRow | null => {
    if (!hasValidPages) return null;
    if (mode === "hours") {
      return projectFromHours(totalPages, customHours, wpm, wpp);
    } else {
      return projectFromPages(totalPages, customPages, wpm, wpp);
    }
  }, [totalPages, mode, customHours, customPages, wpm, wpp, hasValidPages]);

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

  // Selected row for reminder (defaults to the custom row or 1 hour/day)
  const selectedRow = customRow ?? tableRows.find((r) => r.hoursPerDay === 1) ?? tableRows[0];

  return (
    <div className="mt-10 space-y-8">
      {/* Section heading */}
      <div className="border-b-2 border-accent pb-2">
        <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-accent">
          // PROJECTION MAP
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
        manualPageCount={manualPageCount}
        onManualPageCountChange={setManualPageCount}
        hasPageCount={!!book.pageCount}
      />

      {!hasValidPages ? (
        <div className="border-2 border-border bg-bg-surface p-6 text-center font-mono text-sm text-fg-muted uppercase tracking-wide">
          // Enter a page count above to generate projections
        </div>
      ) : (
        <>
          {/* Projection Table — THE MAIN EVENT */}
          <div className="border-[3px] border-border-hard">
            {/* Table heading bar */}
            <div className="bg-bg-surface border-b-2 border-border-hard px-4 py-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-fg">
                PROJECTION TABLE — {totalPages.toLocaleString()} PAGES
              </h3>
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
            // {wpm} wpm &middot; {wpp} words/page &middot; start: today
          </p>

          {/* Download Buttons */}
          <DownloadButtons book={book} rows={allRows} wpm={wpm} wpp={wpp} totalPages={totalPages} />

          {/* Reminder Form */}
          {selectedRow && (
            <ReminderForm book={book} selectedRow={selectedRow} />
          )}
        </>
      )}
    </div>
  );
}
