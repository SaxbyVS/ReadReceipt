"use client";

import { useEffect } from "react";
import { Book } from "@/types";

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

export default function RecentBookTracker({ book }: { book: Book }) {
  useEffect(() => {
    const recent: RecentBook[] = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    const nextBook: RecentBook = {
      isbn: book.isbn,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      source: book.source,
      language: book.language,
      href: book.source === "manual" ? "/manual" : `/book/${book.isbn}`,
    };

    const deduped = [nextBook, ...recent.filter((item) => !(item.isbn === nextBook.isbn && item.title === nextBook.title))].slice(0, 5);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    window.dispatchEvent(new CustomEvent("readreceipt:recent-books-updated", { detail: deduped }));
  }, [book]);

  return null;
}
