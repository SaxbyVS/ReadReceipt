import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/openLibrary";
import { ApiResponse, BookSearchResult } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const results = await searchBooks(query.trim());
    return NextResponse.json<ApiResponse<BookSearchResult[]>>({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to search books. Please try again." },
      { status: 500 }
    );
  }
}
