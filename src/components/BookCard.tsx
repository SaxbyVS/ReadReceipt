import Link from "next/link";
import { BookSearchResult } from "@/types";

interface BookCardProps {
  book: BookSearchResult;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.isbn}?work=${encodeURIComponent(book.workKey)}&title=${encodeURIComponent(book.title)}`}
      className="group flex gap-4 border-2 border-border bg-bg-surface p-4 hover:border-accent"
    >
      {/* Cover thumbnail */}
      <div className="h-28 w-20 flex-shrink-0 overflow-hidden border border-border bg-bg-elevated">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-mono uppercase text-fg-muted">
            No<br />Cover
          </div>
        )}
      </div>

      {/* Book info */}
      <div className="flex flex-col justify-center min-w-0">
        <h3 className="font-mono font-bold text-fg group-hover:text-accent truncate uppercase tracking-wide text-sm">
          {book.title}
        </h3>
        <p className="text-sm text-fg-muted truncate">
          {book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author"}
        </p>
        {book.firstPublishYear && (
          <p className="mt-1 text-xs text-fg-muted font-mono">
            {book.firstPublishYear}
          </p>
        )}
        <p className="mt-1 text-xs text-accent font-mono tracking-wider">
          ISBN {book.isbn}
        </p>
      </div>
    </Link>
  );
}
