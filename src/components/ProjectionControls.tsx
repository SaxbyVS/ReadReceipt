"use client";

import { ProjectionMode } from "@/types";
import { DEFAULT_WPM, DEFAULT_WPP } from "@/lib/projection";

interface ProjectionControlsProps {
  mode: ProjectionMode;
  onModeChange: (mode: ProjectionMode) => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  wpp: number;
  onWppChange: (wpp: number) => void;
  customHours: number;
  onCustomHoursChange: (hours: number) => void;
  customPages: number;
  onCustomPagesChange: (pages: number) => void;
  customPercent: number;
  onCustomPercentChange: (percent: number) => void;
  manualPageCount: string;
  onManualPageCountChange: (val: string) => void;
  onPageCountReset: () => void;
  defaultPageCount: number | null;
  hasPageCount: boolean;
}

export default function ProjectionControls({
  mode,
  onModeChange,
  wpm,
  onWpmChange,
  wpp,
  onWppChange,
  customHours,
  onCustomHoursChange,
  customPages,
  onCustomPagesChange,
  customPercent,
  onCustomPercentChange,
  manualPageCount,
  onManualPageCountChange,
  onPageCountReset,
  defaultPageCount,
  hasPageCount,
}: ProjectionControlsProps) {
  const dashboardValue =
    mode === "hours"
      ? Math.round((customHours * 60 * wpm) / wpp)
      : mode === "pages"
      ? customPages
      : customPercent;
  const dashboardLabel = mode === "percent" ? "% / day" : "pages / day";
  const hasPageCountOverride =
    defaultPageCount !== null && manualPageCount !== "" && Number(manualPageCount) !== defaultPageCount;

  return (
    <div className="space-y-6">
      <div className="border-2 border-border bg-bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-fg-muted mb-2">
            {defaultPageCount !== null
              ? "// PAGE COUNT (EDITABLE)"
              : "// ENTER PAGE COUNT (OPTIONAL)"}
          </label>
          <input
            type="number"
            min={1}
            max={50000}
            value={manualPageCount}
            onChange={(e) => onManualPageCountChange(e.target.value)}
            placeholder={defaultPageCount !== null ? defaultPageCount.toString() : "e.g. 320"}
            className="w-40 border-b-2 border-border bg-transparent px-1 py-2 text-sm font-mono text-fg placeholder:text-fg-muted/50 focus:outline-none focus:border-accent"
          />
          </div>
          {defaultPageCount !== null && (
            <button
              type="button"
              onClick={onPageCountReset}
              disabled={!hasPageCountOverride}
              className="border-2 border-border px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:text-accent"
            >
              Reset Default
            </button>
          )}
        </div>
        {defaultPageCount !== null && (
          <p className="mt-3 text-xs font-mono text-fg-muted uppercase tracking-wide">
            {`// default from open library: ${defaultPageCount} pages`}
          </p>
        )}
        {!hasPageCount && (
          <p className="mt-3 text-xs font-mono text-fg-muted uppercase tracking-wide">
            {"// no page count? use percent/day mode below"}
          </p>
        )}
      </div>

      {/* Two-column grid: Reading Speed + Daily Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reading Speed */}
        <div className="border-2 border-border bg-bg-surface p-4">
          <label className="block font-mono text-xs uppercase tracking-widest text-fg-muted mb-3">
            {"// READING SPEED"}
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={100}
                max={600}
                step={10}
                value={wpm}
                onChange={(e) => onWpmChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <input
                type="number"
                min={50}
                max={1000}
                value={wpm}
                onChange={(e) => onWpmChange(Number(e.target.value) || DEFAULT_WPM)}
                className="w-20 border-b-2 border-border bg-transparent px-1 py-1 text-sm font-mono text-fg text-center focus:outline-none focus:border-accent"
              />
              <span className="text-xs font-mono text-fg-muted">WPM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-fg-muted uppercase">Words/Page:</span>
              <input
                type="number"
                min={100}
                max={500}
                value={wpp}
                onChange={(e) => onWppChange(Number(e.target.value) || DEFAULT_WPP)}
                className="w-20 border-b-2 border-border bg-transparent px-1 py-1 text-sm font-mono text-fg text-center focus:outline-none focus:border-accent"
              />
            </div>
            <p className="text-xs font-mono text-fg-muted">{"// avg adult ~250 wpm, ~250 wpp"}</p>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="border-2 border-border bg-bg-surface p-4">
          <label className="block font-mono text-xs uppercase tracking-widest text-fg-muted mb-3">
            {"// DAILY GOAL"}
          </label>

          {/* Mode toggle */}
          <div className="flex gap-0 mb-4">
            <button
              onClick={() => onModeChange("hours")}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-2 ${
                mode === "hours"
                  ? "bg-accent text-black border-accent font-bold"
                  : "bg-transparent text-fg-muted border-border hover:text-fg"
              }`}
            >
              Hours/Day
            </button>
            <button
              onClick={() => onModeChange("pages")}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-l-0 ${
                mode === "pages"
                  ? "bg-accent text-black border-accent font-bold"
                  : "bg-transparent text-fg-muted border-border hover:text-fg"
              }`}
            >
              Pages/Day
            </button>
            {!hasPageCount && (
              <button
                onClick={() => onModeChange("percent")}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-l-0 ${
                  mode === "percent"
                    ? "bg-accent text-black border-accent font-bold"
                    : "bg-transparent text-fg-muted border-border hover:text-fg"
                }`}
              >
                %/Day
              </button>
            )}
          </div>

          {mode === "hours" ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.25}
                max={12}
                step={0.25}
                value={customHours}
                onChange={(e) => onCustomHoursChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-sm text-fg w-16 text-center">
                {customHours}h
              </span>
            </div>
          ) : mode === "pages" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={1000}
                value={customPages}
                onChange={(e) => onCustomPagesChange(Number(e.target.value))}
                className="w-24 border-b-2 border-border bg-transparent px-1 py-1 text-sm font-mono text-fg text-center focus:outline-none focus:border-accent"
              />
              <span className="text-xs font-mono text-fg-muted uppercase">pages/day</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={customPercent}
                onChange={(e) => onCustomPercentChange(Number(e.target.value))}
                className="w-24 border-b-2 border-border bg-transparent px-1 py-1 text-sm font-mono text-fg text-center focus:outline-none focus:border-accent"
              />
              <span className="text-xs font-mono text-fg-muted uppercase">% of book/day</span>
            </div>
          )}

          {/* Dashboard number — large emphasis */}
          <div className="mt-4 pt-4 border-t-2 border-border">
            <span className="data-value text-3xl md:text-4xl">{dashboardValue}</span>
            <span className="text-sm font-mono text-fg-muted ml-2 uppercase">{dashboardLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
