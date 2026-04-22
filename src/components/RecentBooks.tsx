"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "readreceipt-recent-books-v2";

type RecentBook = {
  isbn: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  source?: "openlibrary" | "manual";
  language: string | null;
  href: string;
};

function shortenTitle(title: string, maxLength = 26): string {
  return title.length > maxLength ? `${title.slice(0, maxLength - 1)}…` : title;
}

function isTitleTruncated(title: string, maxLength = 26): boolean {
  return title.length > maxLength;
}

export default function RecentBooks() {
  const [books] = useState<RecentBook[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [liveBooks, setLiveBooks] = useState<RecentBook[]>(books);

  useEffect(() => {
    function handleRecentBooksUpdate(event: Event) {
      const customEvent = event as CustomEvent<RecentBook[]>;
      setLiveBooks(customEvent.detail ?? []);
    }

    window.addEventListener("readreceipt:recent-books-updated", handleRecentBooksUpdate);
    return () => window.removeEventListener("readreceipt:recent-books-updated", handleRecentBooksUpdate);
  }, []);

  if (liveBooks.length === 0) return null;

  function clearRecentBooks() {
    const confirmed = window.confirm("Clear all recent books?");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setLiveBooks([]);
    window.dispatchEvent(new CustomEvent("readreceipt:recent-books-updated", { detail: [] }));
  }

  return (
    <section className="border-2 border-border bg-bg-surface p-4 space-y-4 rounded-lg">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
        <h2 className="text-sm font-mono uppercase tracking-widest text-accent">
          {"// RECENT BOOKS"}
        </h2>
        <button
          type="button"
          onClick={clearRecentBooks}
          className="border border-border px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-fg-muted hover:border-accent hover:text-accent rounded-md"
        >
          Clear
        </button>
      </div>
      <div className="grid gap-2 overflow-visible">
        {liveBooks.map((book) => (
          <Link
            key={`${book.isbn}-${book.title}`}
            href={book.href}
            className="group relative box-border flex h-[118px] w-full -translate-x-[1px] gap-4 border-2 border-border bg-bg p-4 transition-all duration-150 hover:z-10 hover:border-accent hover:bg-accent-dim focus-visible:z-10 focus-visible:border-accent focus-visible:bg-accent-dim rounded-md"
          >
            <span className="absolute left-3 top-[-2px] h-2.5 w-12 border-x-2 border-t-2 border-accent bg-accent-dim transition-all duration-150 group-hover:w-16 group-focus-visible:w-16" />
            <div className="relative h-24 w-[72px] flex-shrink-0 overflow-hidden border border-border bg-bg-elevated">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-mono uppercase text-fg-muted">
                  No Cover
                </div>
              )}
            </div>
            <div className="min-w-0 flex flex-1 flex-col justify-center gap-1 overflow-hidden">
              <div className="h-10 max-w-[150px] overflow-hidden">
                <h3 className="truncate font-mono text-sm font-bold uppercase tracking-wide text-fg group-hover:text-accent group-focus-visible:text-accent">{shortenTitle(book.title)}</h3>
              </div>
              {isTitleTruncated(book.title) && (
                <div className="pointer-events-none absolute left-[calc(100%-2px)] top-3 z-20 hidden max-w-[260px] border-2 border-accent bg-bg px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-accent shadow-[4px_4px_0_0_var(--accent)] group-hover:block group-focus-visible:block rounded-md">
                  {book.title}
                </div>
              )}
              {book.authors.length > 0 && (
                <p className="max-w-[150px] truncate text-sm text-fg-muted">{book.authors.join(", ")}</p>
              )}
              <div className="flex flex-nowrap gap-2 overflow-hidden text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="truncate border border-border px-1.5 py-0.5 text-fg-muted">
                  {book.source === "manual" ? "manual" : "open library"}
                </span>
                {book.language && <span className="truncate text-accent">{book.language}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
