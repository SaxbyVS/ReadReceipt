import Link from "next/link";
import { BookSearchResult } from "@/types";

interface BookCardProps {
  book: BookSearchResult;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.isbn}`}
      className="group flex gap-4 rounded-lg border border-border bg-surface p-4 hover:border-accent/40 hover:shadow-sm"
    >
      {/* Cover thumbnail */}
      <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded bg-accent-light">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted">
            📕
          </div>
        )}
      </div>

      {/* Book info */}
      <div className="flex flex-col justify-center min-w-0">
        <h3 className="font-semibold text-accent group-hover:underline truncate">
          {book.title}
        </h3>
        <p className="text-sm text-muted truncate">
          {book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}
        </p>
        {book.firstPublishYear && (
          <p className="mt-1 text-xs text-muted">
            First published: {book.firstPublishYear}
          </p>
        )}
        <p className="mt-1 text-xs text-muted font-mono">
          ISBN: {book.isbn}
        </p>
      </div>
    </Link>
  );
}
