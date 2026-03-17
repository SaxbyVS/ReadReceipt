import Link from "next/link";

export default function BookNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="font-mono text-7xl md:text-9xl font-bold text-accent tracking-tighter">
        404
      </div>
      <h1 className="font-mono text-lg uppercase tracking-widest text-fg">
        // BOOK NOT FOUND
      </h1>
      <p className="text-fg-muted text-sm max-w-md text-center leading-relaxed">
        No book matched that ISBN in Open Library&apos;s database.
        It may not exist or may be indexed under a different identifier.
      </p>
      <Link
        href="/"
        className="mt-4 border-[2px] border-accent bg-accent px-8 py-3 font-mono text-xs uppercase tracking-widest text-black font-bold hover:bg-transparent hover:text-accent"
      >
        Back to Search
      </Link>
    </div>
  );
}
