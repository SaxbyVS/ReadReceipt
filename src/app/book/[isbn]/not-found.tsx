import Link from "next/link";

export default function BookNotFound() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">📕</div>
      <h1 className="text-2xl font-bold text-accent">Book Not Found</h1>
      <p className="text-muted max-w-md mx-auto">
        We couldn&apos;t find a book with that ISBN. It may not exist in Open Library&apos;s database.
      </p>
      <Link
        href="/"
        className="inline-block mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
      >
        Back to Search
      </Link>
    </div>
  );
}
