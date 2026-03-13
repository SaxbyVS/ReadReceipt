"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // If it looks like an ISBN (all digits, 10 or 13 chars), go directly to book page
    const isIsbn = /^(\d{10}|\d{13})$/.test(trimmed.replace(/-/g, ""));
    if (isIsbn) {
      router.push(`/book/${trimmed.replace(/-/g, "")}`);
    } else {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by book title, author, or ISBN..."
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent/90 active:scale-[0.98]"
        >
          Search
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        Tip: Enter an ISBN directly (e.g. 9780140449136) to jump straight to the book page.
      </p>
    </form>
  );
}
