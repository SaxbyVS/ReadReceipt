export default function BookLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-bg-surface border border-border" />

      {/* Book info skeleton */}
      <div className="border-[3px] border-border-hard p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="h-64 w-44 flex-shrink-0 bg-bg-surface border-[2px] border-border" />
          <div className="flex flex-col gap-4 flex-1">
            <div className="h-8 w-3/4 bg-bg-surface border border-border" />
            <div className="h-5 w-1/2 bg-bg-surface border border-border" />
            <div className="h-4 w-1/3 bg-bg-surface border border-border mt-2" />
            <div className="h-4 w-1/4 bg-bg-surface border border-border" />
          </div>
        </div>
      </div>

      {/* Projection skeleton */}
      <div className="border-[3px] border-border-hard p-6 space-y-4">
        <div className="h-7 w-64 bg-bg-surface border border-border" />
        <div className="h-10 w-full bg-bg-surface border border-border" />
        <div className="h-48 w-full bg-bg-surface border border-border" />
      </div>
    </div>
  );
}
