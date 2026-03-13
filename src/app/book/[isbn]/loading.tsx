export default function BookLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-24 bg-accent-light rounded" />

      {/* Book info skeleton */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="h-64 w-44 flex-shrink-0 rounded-lg bg-accent-light" />
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-8 w-3/4 bg-accent-light rounded" />
          <div className="h-5 w-1/2 bg-accent-light rounded" />
          <div className="h-4 w-1/3 bg-accent-light rounded mt-2" />
          <div className="h-4 w-1/4 bg-accent-light rounded" />
        </div>
      </div>

      {/* Projection skeleton */}
      <div className="mt-8 space-y-4">
        <div className="h-7 w-64 bg-accent-light rounded" />
        <div className="h-48 w-full bg-accent-light rounded-lg" />
      </div>
    </div>
  );
}
