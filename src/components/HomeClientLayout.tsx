"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import RecentBooks from "@/components/RecentBooks";
import { BookSearchResult } from "@/types";

const STORAGE_KEY = "readreceipt-recent-books-v2";

interface HomeClientLayoutProps {
  q?: string;
  results: BookSearchResult[];
}

const FEATURE_STEPS = [
  {
    number: "01",
    title: "Search",
    description: "Find books by title, author, or ISBN",
    chapter: "Discover your next read",
  },
  {
    number: "02",
    title: "Project",
    description: "See when you'll finish based on your reading speed",
    chapter: "Map the final page",
  },
  {
    number: "03",
    title: "Remind",
    description: "Set up weekly email nudges to stay on track",
    chapter: "Keep your reading streak alive",
  },
] as const;

export default function HomeClientLayout({ q, results }: HomeClientLayoutProps) {
  const [hasRecentBooks, setHasRecentBooks] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const books = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(books) && books.length > 0;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handleRecentBooksUpdate(event: Event) {
      const customEvent = event as CustomEvent<unknown[]>;
      setHasRecentBooks(Array.isArray(customEvent.detail) && customEvent.detail.length > 0);
    }

    window.addEventListener("readreceipt:recent-books-updated", handleRecentBooksUpdate);
    return () => window.removeEventListener("readreceipt:recent-books-updated", handleRecentBooksUpdate);
  }, []);

  const mainContent = (
    <div className="space-y-10">
      <section className="space-y-4 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-fg">
          When will you finish<br />
          <span className="text-accent">your next book?</span>
        </h1>
        <p className="text-fg-muted max-w-xl text-sm font-mono">
          Search for any book to see projected reading times based on your
          pace. Download your plan or set up weekly reminders.
        </p>
      </section>

      <SearchBar />

      {q && (
        <section>
          <h2 className="text-sm font-mono uppercase tracking-widest text-fg-muted mb-4 border-b border-border pb-2">
            {results.length > 0 ? `Results for "${q}"` : `No results found for "${q}"`}
          </h2>

          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((book) => (
                <BookCard key={book.isbn} book={book} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-border bg-bg-surface p-8 text-center text-fg-muted font-mono text-sm">
              <p>No books found. Try a different search term or check the ISBN.</p>
            </div>
          )}
        </section>
      )}

      {!q && (
        <section className="grid gap-4 sm:grid-cols-3 mt-4">
          {FEATURE_STEPS.map((step) => (
            <div key={step.number} className="feature-book group">
              <div className="feature-book__stack">
                <div className="feature-book__pages p-6 pl-8">
                  <div className="space-y-4 text-center">
                    <p className="max-w-[18ch] text-base font-medium leading-6 text-fg">
                      {step.description}
                    </p>
                  </div>
                  <div className="border-t border-border pt-3 text-center text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                    {step.chapter}
                  </div>
                </div>

                <div className="feature-book__cover border-2 border-border bg-bg-surface p-6">
                  <div>
                    <div className="text-accent font-mono text-2xl font-bold mb-2">{step.number}</div>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-fg">{step.title}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );

  if (!hasRecentBooks) {
    return mainContent;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div>{mainContent}</div>
      <aside className="lg:sticky lg:top-8 lg:pt-6">
        <RecentBooks />
      </aside>
    </div>
  );
}
