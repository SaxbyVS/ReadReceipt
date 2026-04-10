import HomeClientLayout from "@/components/HomeClientLayout";
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

  return <HomeClientLayout q={q} results={results} />;
}
