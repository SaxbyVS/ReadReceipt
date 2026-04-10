import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CachedBook from "@/models/CachedBook";
import { getBookByISBN } from "@/lib/openLibrary";
import { ApiResponse, Book } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;
  const workKey = request.nextUrl.searchParams.get("work") ?? undefined;
  const preferredTitle = request.nextUrl.searchParams.get("title") ?? undefined;

  if (!isbn || isbn.trim().length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "ISBN parameter is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    if (!workKey) {
      const cached = await CachedBook.findOne({ isbn: isbn.trim() }).lean();

      if (cached) {
        const book: Book = {
          isbn: cached.isbn,
          title: cached.title,
          authors: cached.authors,
          source: "openlibrary",
          language: cached.language ?? null,
          pageCount: cached.pageCount,
          wordCount: cached.wordCount,
          publishDate: cached.publishDate,
          coverUrl: cached.coverUrl,
          openLibraryUrl: cached.openLibraryUrl ?? null,
        };
        return NextResponse.json<ApiResponse<Book>>({
          success: true,
          data: book,
        });
      }
    }

    // Fetch from Open Library
    const book = await getBookByISBN(isbn.trim(), { workKey, preferredTitle });
    if (!book) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    const canonicalCached = await CachedBook.findOne({ isbn: book.isbn }).lean();
    if (canonicalCached) {
      return NextResponse.json<ApiResponse<Book>>({
        success: true,
        data: {
          isbn: canonicalCached.isbn,
          title: canonicalCached.title,
          authors: canonicalCached.authors,
          source: "openlibrary",
          language: canonicalCached.language ?? null,
          pageCount: canonicalCached.pageCount,
          wordCount: canonicalCached.wordCount,
          publishDate: canonicalCached.publishDate,
          coverUrl: canonicalCached.coverUrl,
          openLibraryUrl: canonicalCached.openLibraryUrl ?? null,
        },
      });
    }

    // Cache the result (upsert to handle race conditions)
    await CachedBook.findOneAndUpdate(
      { isbn: book.isbn },
      {
        isbn: book.isbn,
        title: book.title,
        authors: book.authors,
        language: book.language,
        pageCount: book.pageCount,
        wordCount: book.wordCount,
        publishDate: book.publishDate,
        coverUrl: book.coverUrl,
        openLibraryUrl: book.openLibraryUrl,
        cachedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json<ApiResponse<Book>>({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Book fetch error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to fetch book details." },
      { status: 500 }
    );
  }
}
