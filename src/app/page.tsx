import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import RecentBooks from "@/components/RecentBooks";
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
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-10">
          {/* Hero / Search Section */}
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

          {/* Search Results */}
          {q && (
            <section>
              <h2 className="text-sm font-mono uppercase tracking-widest text-fg-muted mb-4 border-b border-border pb-2">
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
                <div className="border-2 border-border bg-bg-surface p-8 text-center text-fg-muted font-mono text-sm">
                  <p>No books found. Try a different search term or check the ISBN.</p>
                </div>
              )}
            </section>
          )}

          {/* Empty state — no search yet */}
          {!q && (
            <section className="grid gap-4 sm:grid-cols-3 mt-4">
              <div className="border-2 border-border bg-bg-surface p-6">
                <div className="text-accent font-mono text-2xl font-bold mb-2">01</div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-fg mb-1">Search</h3>
                <p className="text-sm text-fg-muted">
                  Find books by title, author, or ISBN
                </p>
              </div>
              <div className="border-2 border-border bg-bg-surface p-6">
                <div className="text-accent font-mono text-2xl font-bold mb-2">02</div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-fg mb-1">Project</h3>
                <p className="text-sm text-fg-muted">
                  See when you&apos;ll finish based on your reading speed
                </p>
              </div>
              <div className="border-2 border-border bg-bg-surface p-6">
                <div className="text-accent font-mono text-2xl font-bold mb-2">03</div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-fg mb-1">Remind</h3>
                <p className="text-sm text-fg-muted">
                  Set up weekly email nudges to stay on track
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:pt-6">
          <RecentBooks />
        </aside>
      </div>
    </div>
  );
}
