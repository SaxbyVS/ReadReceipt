import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReadReceipt — Book Reading Projections",
  description:
    "Search any book and see projected finishing times based on your reading speed. Download your reading plan or set up weekly email reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="border-b border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-bold text-accent">ReadReceipt</span>
            </Link>
            <p className="hidden sm:block text-sm text-muted">
              Know when you&apos;ll finish your next book
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted">
            ReadReceipt — Book data from{" "}
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              Open Library
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
