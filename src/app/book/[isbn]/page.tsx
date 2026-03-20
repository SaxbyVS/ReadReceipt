import { notFound } from "next/navigation";
import Link from "next/link";
import BookInfo from "@/components/BookInfo";
import ProjectionMap from "@/components/ProjectionMap";
import { ApiResponse, Book } from "@/types";

interface BookPageProps {
  params: Promise<{ isbn: string }>;
  searchParams: Promise<{ work?: string; title?: string }>;
}

async function fetchBook(
  isbn: string,
  options?: { work?: string; title?: string }
): Promise<Book | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const params = new URLSearchParams();
    if (options?.work) params.set("work", options.work);
    if (options?.title) params.set("title", options.title);

    const query = params.toString();
    const res = await fetch(`${baseUrl}/api/book/${isbn}${query ? `?${query}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: ApiResponse<Book> = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: BookPageProps) {
  const { isbn } = await params;
  const { work, title } = await searchParams;
  const book = await fetchBook(isbn, { work, title });
  if (!book) {
    return { title: "Book Not Found — ReadReceipt" };
  }
  return {
    title: `${book.title} — ReadReceipt`,
    description: `Reading projections for "${book.title}" by ${book.authors.join(", ")}. See how long it will take to finish.`,
  };
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { isbn } = await params;
  const { work, title } = await searchParams;
  const book = await fetchBook(isbn, { work, title });

  if (!book) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-muted hover:text-accent border-b border-transparent hover:border-accent pb-0.5"
      >
        &larr; // BACK TO SEARCH
      </Link>

      <BookInfo book={book} />
      <ProjectionMap book={book} />
    </div>
  );
}
