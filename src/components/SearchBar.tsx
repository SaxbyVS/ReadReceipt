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
      <div className="flex gap-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="TITLE, AUTHOR, OR ISBN..."
          className="flex-1 border-2 border-border bg-bg-surface px-4 py-3 text-fg font-mono text-sm uppercase tracking-wider placeholder:text-fg-muted/50 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="border-2 border-accent bg-accent px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider text-black hover:bg-transparent hover:text-accent"
        >
          Search
        </button>
      </div>
      <p className="mt-2 text-xs text-fg-muted font-mono">
        {"// Enter an ISBN directly (e.g. 9780140449136) to jump straight to the book page"}
      </p>
    </form>
  );
}
