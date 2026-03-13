import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import { BookSearchResult, ApiResponse } from "@/types";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

async function fetchSearchResults(
  query: string
): Promise<BookSearchResult[]> {
  // Use absolute URL in server component for internal API calls
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/search?q=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data: ApiResponse<BookSearchResult[]> = await res.json();
  return data.data ?? [];
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const results = q ? await fetchSearchResults(q) : [];

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <section className="text-center space-y-4 py-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-accent">
          When will you finish your next book?
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          Search for any book to see projected reading times based on your
          pace. Download your plan or set up weekly reminders.
        </p>
      </section>

      <SearchBar />

      {/* Search Results */}
      {q && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {results.length > 0
              ? `Results for "${q}"`
              : `No results found for "${q}"`}
          </h2>

          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((book) => (
                <BookCard key={book.isbn} book={book} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted">
              <p>No books found. Try a different search term or check the ISBN.</p>
            </div>
          )}
        </section>
      )}

      {/* Empty state — no search yet */}
      {!q && (
        <section className="grid gap-4 sm:grid-cols-3 mt-4">
          <div className="rounded-lg border border-border bg-surface p-5 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-accent">Search</h3>
            <p className="text-sm text-muted mt-1">
              Find books by title, author, or ISBN
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-accent">Project</h3>
            <p className="text-sm text-muted mt-1">
              See when you&apos;ll finish based on your reading speed
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 text-center">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-semibold text-accent">Remind</h3>
            <p className="text-sm text-muted mt-1">
              Set up weekly email nudges to stay on track
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
