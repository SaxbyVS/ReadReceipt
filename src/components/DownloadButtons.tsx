"use client";

import { Book, ProjectionRow } from "@/types";

interface DownloadButtonsProps {
  book: Book;
  rows: ProjectionRow[];
  customRow?: ProjectionRow | null;
  wpm: number;
  wpp: number;
  totalPages: number;
}

function formatDateForExport(iso: string): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DownloadButtons({
  book,
  rows,
  customRow = null,
  wpm,
  wpp,
  totalPages,
}: DownloadButtonsProps) {
  // ─── CSV Download ──────────────────────────────────────

  function downloadCSV() {
    const header = "Hours/Day,Pages/Day,Days to Finish,Total Hours,Finish Date";
    const csvRows = rows.map(
      (r) =>
        `${r.hoursPerDay},${r.pagesPerDay},${r.daysToFinish},${r.totalHours},${formatDateForExport(r.finishDate)}`
    );

    const meta = [
      `# ReadReceipt - Reading Projection`,
      `# Book: ${book.title}`,
      `# Author(s): ${book.authors.join(", ")}`,
      `# Pages: ${totalPages}`,
      `# Reading Speed: ${wpm} wpm (${wpp} words/page)`,
      `# Generated: ${new Date().toLocaleDateString()}`,
      "",
    ];

    const content = [...meta, header, ...csvRows].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `readreceipt-${book.isbn}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ─── PDF Download ──────────────────────────────────────

  function isCustomRow(row: ProjectionRow): boolean {
    if (!customRow) return false;
    return (
      Math.abs(row.hoursPerDay - customRow.hoursPerDay) < 0.01 &&
      row.pagesPerDay === customRow.pagesPerDay
    );
  }

  async function downloadPDF() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    // Read current theme from DOM
    const isDark = document.documentElement.dataset.theme !== "light";

    const colors = isDark
      ? {
          bg: [13, 13, 13] as [number, number, number],
          bgSurface: [26, 26, 26] as [number, number, number],
          fg: [240, 240, 240] as [number, number, number],
          fgMuted: [136, 136, 136] as [number, number, number],
          accent: [57, 255, 20] as [number, number, number],
          border: [51, 51, 51] as [number, number, number],
        }
      : {
          bg: [250, 252, 255] as [number, number, number],
          bgSurface: [238, 244, 251] as [number, number, number],
          fg: [11, 18, 32] as [number, number, number],
          fgMuted: [86, 97, 115] as [number, number, number],
          accent: [0, 166, 255] as [number, number, number],
          border: [185, 198, 216] as [number, number, number],
        };

    const doc = new jsPDF();

    // Background
    doc.setFillColor(...colors.bg);
    doc.rect(0, 0, 210, 297, "F");

    // Title
    doc.setFontSize(20);
    doc.setTextColor(...colors.accent);
    doc.text("READRECEIPT", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(...colors.fgMuted);
    doc.text("// READING PROJECTION MAP", 14, 27);

    // Book info
    doc.setFontSize(14);
    doc.setTextColor(...colors.fg);
    doc.text(book.title.toUpperCase(), 14, 40);

    doc.setFontSize(10);
    doc.setTextColor(...colors.fgMuted);
    doc.text(`by ${book.authors.join(", ")}`, 14, 47);
    doc.text(
      `${totalPages.toLocaleString()} pages | ${wpm} wpm | ${wpp} words/page`,
      14,
      53
    );

    // Table with YOUR PICK highlighting
    autoTable(doc, {
      startY: 60,
      head: [["Hours/Day", "Pages/Day", "Days to Finish", "Total Hours", "Finish Date"]],
      body: rows.map((r) => {
        const pick = isCustomRow(r);
        return [
          pick ? `>>> ${r.hoursPerDay}h YOUR PICK` : `${r.hoursPerDay}h`,
          r.pagesPerDay.toString(),
          `${r.daysToFinish} days`,
          `${r.totalHours}h`,
          formatDateForExport(r.finishDate),
        ];
      }),
      theme: "grid",
      headStyles: {
        fillColor: colors.accent,
        textColor: isDark ? [0, 0, 0] : [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: colors.bgSurface,
        textColor: colors.fg,
      },
      alternateRowStyles: {
        fillColor: colors.bg,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: colors.border,
        lineWidth: 0.5,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.section === "body" && isCustomRow(rows[data.row.index])) {
          data.cell.styles.fillColor = colors.accent;
          data.cell.styles.textColor = isDark ? [0, 0, 0] : [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(...colors.fgMuted);
    doc.text(
      `Generated by ReadReceipt on ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 10
    );

    doc.save(`readreceipt-${book.isbn}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={downloadCSV}
        className="border-2 border-border bg-bg-surface px-5 py-2 text-sm font-mono font-bold uppercase tracking-wider text-fg hover:border-fg hover:text-accent"
      >
        Download CSV
      </button>
      <button
        onClick={downloadPDF}
        className="border-2 border-accent bg-accent px-5 py-2 text-sm font-mono font-bold uppercase tracking-wider text-black hover:bg-transparent hover:text-accent"
      >
        Download PDF
      </button>
    </div>
  );
}
