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
import { ReceiptCode, receiptCodeFromIsbn } from "@/lib/receiptCode";

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
  const selectedPercentRow = customPercentRow ?? percentTableRows.find((r) => r.percentPerDay === 5) ?? percentTableRows[0];

  // Stable order number + barcode pattern, derived from the book's identity.
  const receiptCode = useMemo<ReceiptCode>(
    () => receiptCodeFromIsbn(book.isbn, book.title),
    [book.isbn, book.title]
  );

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
          <div className="receipt-wrap">
          <div className="receipt-edge-top" aria-hidden="true" />
          <div className="border-x-[3px] border-border-hard bg-bg">
            <ReceiptHeader orderNumber={receiptCode.orderNumber} />
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

            <ReceiptFooter
              orderNumber={receiptCode.orderNumber}
              barcodeWidths={receiptCode.barcodeWidths}
              totalLabel="TOTAL"
              totalValue={
                selectedPercentRow
                  ? `100% · ${selectedPercentRow.daysToFinish}D`
                  : "100%"
              }
            />
          </div>
          <div className="receipt-edge-bottom" aria-hidden="true" />
          </div>

          <p className="text-xs font-mono text-fg-muted uppercase tracking-wide">
            {"// percent/day mode works without a page count"}
          </p>

          <DownloadButtons
            book={book}
            percentRows={allPercentRows}
            customPercentRow={customPercentRow}
            wpm={wpm}
            wpp={wpp}
            totalPages={0}
          />

          {selectedPercentRow && (
            <ReminderForm book={book} selectedPercentRow={selectedPercentRow} />
          )}
        </>
      ) : (
        <>
          {/* Projection Table — THE MAIN EVENT */}
          <div className="receipt-wrap">
          <div className="receipt-edge-top" aria-hidden="true" />
          <div className="border-x-[3px] border-border-hard bg-bg">
            <ReceiptHeader orderNumber={receiptCode.orderNumber} />
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

            <ReceiptFooter
              orderNumber={receiptCode.orderNumber}
              barcodeWidths={receiptCode.barcodeWidths}
              totalLabel="TOTAL"
              totalValue={
                selectedRow
                  ? `${totalPages.toLocaleString()} PG · ${selectedRow.totalHours}H`
                  : `${totalPages.toLocaleString()} PG`
              }
            />
          </div>
          <div className="receipt-edge-bottom" aria-hidden="true" />
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

/* ------------------------------------------------------------------ */
/* Receipt chrome — header, timestamp, and footer subcomponents.       */
/* Purely visual. No effect on projection logic or exports.            */
/* ------------------------------------------------------------------ */

function PrintTimestamp() {
  const [stamp, setStamp] = useState<string>("--/--/---- --:--:--");

  useEffect(() => {
    const format = () => {
      const d = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const datePart = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
      const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      setStamp(`${datePart} ${timePart}`);
    };
    format();
    const id = window.setInterval(format, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{stamp}</span>;
}

function ReceiptHeader({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="border-b border-dashed border-border px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-fg-muted leading-relaxed">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-fg">READRECEIPT · TERMINAL v1.0</span>
        <span>ORDER #{orderNumber}</span>
      </div>
      <div className="mt-1">
        [<PrintTimestamp />] PRINTING PROJECTION.LOG
      </div>
    </div>
  );
}

interface ReceiptFooterProps {
  orderNumber: string;
  barcodeWidths: number[];
  totalLabel: string;
  totalValue: string;
}

function ReceiptFooter({ orderNumber, barcodeWidths, totalLabel, totalValue }: ReceiptFooterProps) {
  return (
    <div className="border-t border-dashed border-border px-4 py-4 space-y-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
      <div className="receipt-leader text-fg">
        <span className="font-bold">{totalLabel}</span>
        <span className="receipt-leader__dots" aria-hidden="true" />
        <span className="font-bold">{totalValue}</span>
      </div>

      <div className="barcode" role="img" aria-label={`Barcode for order ${orderNumber}`}>
        {barcodeWidths.map((w, i) => (
          <span key={i} style={{ width: `${w}px` }} />
        ))}
      </div>

      <div className="text-center text-fg tracking-[0.35em]">{orderNumber}</div>

      <div className="text-center text-accent">{"// END OF TRANSMISSION"}</div>
    </div>
  );
}
