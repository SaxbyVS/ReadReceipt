import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CachedBook from "@/models/CachedBook";
import { getBookByISBN } from "@/lib/openLibrary";
import { ApiResponse, Book } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;

  if (!isbn || isbn.trim().length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "ISBN parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    await dbConnect();
    const cached = await CachedBook.findOne({ isbn: isbn.trim() }).lean();

    if (cached) {
      const book: Book = {
        isbn: cached.isbn,
        title: cached.title,
        authors: cached.authors,
        pageCount: cached.pageCount,
        wordCount: cached.wordCount,
        publishDate: cached.publishDate,
        coverUrl: cached.coverUrl,
      };
      return NextResponse.json<ApiResponse<Book>>({
        success: true,
        data: book,
      });
    }

    // Fetch from Open Library
    const book = await getBookByISBN(isbn.trim());
    if (!book) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    // Cache the result (upsert to handle race conditions)
    await CachedBook.findOneAndUpdate(
      { isbn: book.isbn },
      {
        isbn: book.isbn,
        title: book.title,
        authors: book.authors,
        pageCount: book.pageCount,
        wordCount: book.wordCount,
        publishDate: book.publishDate,
        coverUrl: book.coverUrl,
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
