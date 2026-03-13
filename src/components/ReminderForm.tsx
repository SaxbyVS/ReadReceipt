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
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="font-semibold text-accent mb-1">Set Up Weekly Email Reminder</h3>
      <p className="text-sm text-muted mb-4">
        Get a weekly nudge to keep reading at {selectedRow.hoursPerDay}h/day ({selectedRow.pagesPerDay} pages/day).
        Reminders stop automatically after your projected finish date or 3 months.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
        >
          {status === "loading" ? "Setting up..." : "Set Reminder"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "success" ? "text-success" : "text-error"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
