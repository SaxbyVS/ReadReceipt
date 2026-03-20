import { Book } from "@/types";

interface BookInfoProps {
  book: Book;
}

export default function BookInfo({ book }: BookInfoProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Cover */}
      <div className="h-64 w-44 flex-shrink-0 overflow-hidden border-[3px] border-border-hard bg-bg-surface self-start">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm uppercase tracking-widest text-fg-muted">
            No Cover
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wider text-fg">
          {book.title}
        </h1>
        <p className="text-lg text-fg-muted">
          {book.authors.join(", ")}
        </p>

        {book.language && (
          <div className="mt-1 inline-flex self-start border-2 border-accent bg-accent-dim px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
            {book.language} edition
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-mono">
          {book.pageCount && (
            <div>
              <span className="text-xs uppercase tracking-widest text-fg-muted">Pages</span>{" "}
              <span className="text-accent font-bold">{book.pageCount.toLocaleString()}</span>
            </div>
          )}
          {book.wordCount && (
            <div>
              <span className="text-xs uppercase tracking-widest text-fg-muted">Est. Words</span>{" "}
              <span className="text-fg">
                ~{book.wordCount.toLocaleString()}
              </span>
            </div>
          )}
          {book.publishDate && (
            <div>
              <span className="text-xs uppercase tracking-widest text-fg-muted">Published</span>{" "}
              <span className="text-fg">{book.publishDate}</span>
            </div>
          )}
          <div>
            <span className="text-xs uppercase tracking-widest text-fg-muted">ISBN</span>{" "}
            <span className="text-accent">{book.isbn}</span>
          </div>
          {book.openLibraryUrl && (
            <div>
              <a
                href={book.openLibraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-accent hover:underline"
              >
                {"// VIEW ON OPEN LIBRARY ->"}
              </a>
            </div>
          )}
        </div>

        {!book.pageCount && (
          <p className="mt-3 border-2 border-border bg-bg-surface px-3 py-2 text-sm font-mono text-fg-muted">
            {"// Page count unavailable - enter it manually below or use %/day mode"}
          </p>
        )}
      </div>
    </div>
  );
}
