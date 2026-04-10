"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "readreceipt-recent-books";

type RecentBook = {
  isbn: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  source?: "openlibrary" | "manual";
  language: string | null;
  href: string;
};

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

  return (
    <section className="border-2 border-border bg-bg-surface p-4 space-y-4">
      <h2 className="border-b border-border pb-2 text-sm font-mono uppercase tracking-widest text-accent">
        {"// RECENT BOOKS"}
      </h2>
      <div className="grid gap-3">
        {liveBooks.map((book) => (
          <Link
            key={`${book.isbn}-${book.title}`}
            href={book.href}
            className="group relative flex gap-4 border-2 border-border bg-bg p-4 transition-transform duration-150 hover:z-10 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-accent hover:bg-accent-dim focus-visible:z-10 focus-visible:-translate-y-0.5 focus-visible:scale-[1.02] focus-visible:border-accent focus-visible:bg-accent-dim"
          >
            <span className="absolute left-3 top-[-2px] h-2.5 w-12 border-x-2 border-t-2 border-accent bg-accent-dim" />
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
            <div className="min-w-0 flex flex-col justify-center gap-1">
              <h3 className="truncate font-mono text-sm font-bold uppercase tracking-wide text-fg group-hover:text-accent group-focus-visible:text-accent">{book.title}</h3>
              {book.authors.length > 0 && (
                <p className="truncate text-sm text-fg-muted">{book.authors.join(", ")}</p>
              )}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
                <span className="border border-border px-1.5 py-0.5 text-fg-muted">
                  {book.source === "manual" ? "manual" : "open library"}
                </span>
                {book.language && <span className="text-accent">{book.language}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
