"use client";

import { useState, FormEvent } from "react";
import { Book, ProjectionRow } from "@/types";

interface ReminderFormProps {
  book: Book;
  selectedRow: ProjectionRow;
}

export default function ReminderForm({ book, selectedRow }: ReminderFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          bookTitle: book.title,
          bookISBN: book.isbn,
          readingPlan: {
            hoursPerDay: selectedRow.hoursPerDay,
            pagesPerDay: selectedRow.pagesPerDay,
            projectedFinishDate: selectedRow.finishDate,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          `Reminder set! You'll receive weekly emails about "${book.title}" until ${new Date(
            selectedRow.finishDate
          ).toLocaleDateString()}.`
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="border-2 border-border bg-bg-surface p-5">
      <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-1">
        // WEEKLY REMINDER
      </h3>
      <p className="text-sm font-mono text-fg-muted mb-4">
        Get a weekly nudge — {selectedRow.hoursPerDay}h/day ({selectedRow.pagesPerDay} pages/day).
        Auto-stops after finish date or 3 months.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg placeholder:text-fg-muted/50 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="border-2 border-accent bg-accent px-5 py-2 text-sm font-mono font-bold uppercase tracking-wider text-black hover:bg-transparent hover:text-accent disabled:opacity-50 sm:border-l-0"
        >
          {status === "loading" ? "SETTING UP..." : "SET REMINDER"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm font-mono ${
            status === "success" ? "text-success" : "text-error"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
