"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // If it looks like an ISBN (all digits, 10 or 13 chars), go directly to book page
    const isIsbn = /^(\d{10}|\d{13})$/.test(trimmed.replace(/-/g, ""));
    startTransition(() => {
      if (isIsbn) {
        router.push(`/book/${trimmed.replace(/-/g, "")}`);
      } else {
        router.push(`/?q=${encodeURIComponent(trimmed)}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-wrap gap-0 gap-y-2 sm:flex-nowrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="TITLE, AUTHOR, OR ISBN..."
          disabled={isPending}
          className="flex-1 border-2 border-border bg-bg-surface px-4 py-3 text-fg font-mono text-sm uppercase tracking-wider placeholder:text-fg-muted/50 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="border-2 border-accent bg-accent px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider text-black hover:bg-transparent hover:text-accent"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
        <Link
          href="/manual"
          className="border-2 border-border bg-bg-surface px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider text-accent hover:border-accent sm:border-l-0"
        >
          Manual Input
        </Link>
      </div>
      <p className="mt-2 text-xs text-fg-muted font-mono">
        {"// Enter an ISBN directly (e.g. 9780140449136) to jump straight to the book page"}
      </p>
      {isPending && (
        <p className="mt-2 text-xs font-mono uppercase tracking-wide text-accent">
          {"// loading results"}
        </p>
      )}
    </form>
  );
}
