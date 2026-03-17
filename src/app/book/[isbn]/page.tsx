import { notFound } from "next/navigation";
import Link from "next/link";
import BookInfo from "@/components/BookInfo";
import ProjectionMap from "@/components/ProjectionMap";
import { ApiResponse, Book } from "@/types";

interface BookPageProps {
  params: Promise<{ isbn: string }>;
}

async function fetchBook(isbn: string): Promise<Book | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/book/${isbn}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: ApiResponse<Book> = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BookPageProps) {
  const { isbn } = await params;
  const book = await fetchBook(isbn);
  if (!book) {
    return { title: "Book Not Found — ReadReceipt" };
  }
  return {
    title: `${book.title} — ReadReceipt`,
    description: `Reading projections for "${book.title}" by ${book.authors.join(", ")}. See how long it will take to finish.`,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { isbn } = await params;
  const book = await fetchBook(isbn);

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
