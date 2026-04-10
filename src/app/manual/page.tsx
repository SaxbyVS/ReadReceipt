"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import BookInfo from "@/components/BookInfo";
import ProjectionMap from "@/components/ProjectionMap";
import RecentBookTracker from "@/components/RecentBookTracker";
import { Book } from "@/types";

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function ManualPage() {
  const [title, setTitle] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [author, setAuthor] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [book, setBook] = useState<Book | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const parsedPageCount = parseOptionalNumber(pageCount);
    if (!trimmedTitle || !parsedPageCount) return;

    setBook({
      isbn: "MANUAL ENTRY",
      title: trimmedTitle,
      authors: author.trim() ? [author.trim()] : [],
      source: "manual",
      language: null,
      pageCount: parsedPageCount,
      wordCount: parseOptionalNumber(wordCount),
      publishDate: publishDate.trim() || null,
      coverUrl: null,
      openLibraryUrl: null,
    });
  }

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-muted hover:text-accent border-b border-transparent hover:border-accent pb-0.5"
      >
        &larr; // BACK TO SEARCH
      </Link>

      <section className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-fg">
          Build a projection from<br />
          <span className="text-accent">manual book input</span>
        </h1>
      </section>

      <section className="border-2 border-border bg-bg-surface p-5 space-y-5">
        <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-accent">
          {"// MANUAL INPUT"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Title</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg focus:outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Page Count</span>
            <input
              type="number"
              min={1}
              required
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              className="border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg focus:outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Author (Optional)</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg focus:outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Word Count (Optional)</span>
            <input
              type="number"
              min={1}
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              className="border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg focus:outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Release Date (Optional)</span>
            <input
              type="text"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              placeholder="e.g. 2024 or Sep 2024"
              className="border-2 border-border bg-bg px-3 py-2 text-sm font-mono text-fg placeholder:text-fg-muted/50 focus:outline-none focus:border-accent"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="border-2 border-accent bg-accent px-6 py-3 text-sm font-mono font-bold uppercase tracking-wider text-black hover:bg-transparent hover:text-accent"
            >
              Build Projection
            </button>
          </div>
        </form>
      </section>

      {book && (
        <div className="space-y-8">
          <RecentBookTracker book={book} />
          <BookInfo book={book} />
          <ProjectionMap book={book} />
        </div>
      )}
    </div>
  );
}
