import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Analytics } from "@vercel/analytics/next";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem('readreceipt-theme');
                document.documentElement.dataset.theme = stored === 'light' ? 'light' : 'dark';
              } catch {
                document.documentElement.dataset.theme = 'dark';
              }
            })();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-bg text-fg`}
      >
        <header className="border-b-2 border-border bg-bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80">
              <span className="text-accent font-mono text-sm tracking-widest uppercase border border-accent px-2 py-0.5">
                {"//"}
              </span>
              <span className="text-xl font-mono font-bold tracking-wider uppercase text-fg">
                Read<span className="text-accent">Receipt</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-xs font-mono uppercase tracking-widest text-fg-muted">
                Know when you&apos;ll finish
              </p>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t-2 border-border mt-16">
          <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-fg-muted">
            <span>ReadReceipt</span>
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-accent"
            >
              Data: Open Library
            </a>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
