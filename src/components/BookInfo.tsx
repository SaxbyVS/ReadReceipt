import { Book } from "@/types";

interface BookInfoProps {
  book: Book;
}

export default function BookInfo({ book }: BookInfoProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Cover */}
      <div className="h-64 w-44 flex-shrink-0 overflow-hidden rounded-lg bg-accent-light shadow-md self-start">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted">
            📕
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-accent">{book.title}</h1>
        <p className="text-lg text-muted">
          {book.authors.join(", ")}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {book.pageCount && (
            <div>
              <span className="font-medium text-foreground">Pages:</span>{" "}
              <span className="text-muted">{book.pageCount.toLocaleString()}</span>
            </div>
          )}
          {book.wordCount && (
            <div>
              <span className="font-medium text-foreground">Est. Words:</span>{" "}
              <span className="text-muted">
                ~{book.wordCount.toLocaleString()}
                {book.pageCount ? " (estimated from page count)" : ""}
              </span>
            </div>
          )}
          {book.publishDate && (
            <div>
              <span className="font-medium text-foreground">Published:</span>{" "}
              <span className="text-muted">{book.publishDate}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-foreground">ISBN:</span>{" "}
            <span className="font-mono text-muted">{book.isbn}</span>
          </div>
        </div>

        {!book.pageCount && (
          <p className="mt-3 rounded-md bg-accent-light/60 px-3 py-2 text-sm text-muted">
            Page count not available from Open Library. You can enter it manually below to generate projections.
          </p>
        )}
      </div>
    </div>
  );
}
