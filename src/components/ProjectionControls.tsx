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
  manualPageCount: string;
  onManualPageCountChange: (val: string) => void;
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
  manualPageCount,
  onManualPageCountChange,
  hasPageCount,
}: ProjectionControlsProps) {
  return (
    <div className="space-y-5">
      {/* Manual page count input (shown when book has no page count) */}
      {!hasPageCount && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Enter Page Count Manually
          </label>
          <input
            type="number"
            min={1}
            max={50000}
            value={manualPageCount}
            onChange={(e) => onManualPageCountChange(e.target.value)}
            placeholder="e.g. 320"
            className="w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      )}

      {/* Reading speed */}
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Reading Speed (words/min)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value))}
              className="w-40 accent-accent"
            />
            <input
              type="number"
              min={50}
              max={1000}
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value) || DEFAULT_WPM)}
              className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <p className="text-xs text-muted mt-1">Average adult: ~250 wpm</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Words per Page
          </label>
          <input
            type="number"
            min={100}
            max={500}
            value={wpp}
            onChange={(e) => onWppChange(Number(e.target.value) || DEFAULT_WPP)}
            className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <p className="text-xs text-muted mt-1">Standard: ~250</p>
        </div>
      </div>

      {/* Mode toggle + custom input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Custom Projection
        </label>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onModeChange("hours")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              mode === "hours"
                ? "bg-accent text-white"
                : "bg-accent-light text-foreground hover:bg-accent-light/80"
            }`}
          >
            Hours/Day
          </button>
          <button
            onClick={() => onModeChange("pages")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              mode === "pages"
                ? "bg-accent text-white"
                : "bg-accent-light text-foreground hover:bg-accent-light/80"
            }`}
          >
            Pages/Day
          </button>
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
              className="w-48 accent-accent"
            />
            <span className="text-sm font-mono w-16 text-center">
              {customHours}h/day
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1000}
              value={customPages}
              onChange={(e) => onCustomPagesChange(Number(e.target.value))}
              className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <span className="text-sm text-muted">pages/day</span>
          </div>
        )}
      </div>
    </div>
  );
}
