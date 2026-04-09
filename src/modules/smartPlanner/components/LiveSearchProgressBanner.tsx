// ─────────────────────────────────────────────────────────────────────────────
// LiveSearchProgressBanner
//
// Shows a subtle progress indicator while live supplier queries are running.
// Appears below the package list and disappears when all results are in.
//
// The spinner + "Searching more suppliers…" message lets the user know
// there may be more results coming — so they don't click away too soon.
// ─────────────────────────────────────────────────────────────────────────────

import { Loader2 } from "lucide-react";

interface LiveSearchProgressBannerProps {
  progress: { completed: number; total: number } | null;
}

export function LiveSearchProgressBanner({ progress }: LiveSearchProgressBannerProps) {
  // Format the progress text: "2 of 3 complete" or just "Searching…"
  const progressText = progress && progress.total > 0
    ? `Searching more suppliers… (${progress.completed} of ${progress.total} complete)`
    : 'Searching more suppliers…';

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-info/10 border border-info/30 rounded-xl text-sm text-info mt-2">
      <Loader2 className="size-4 animate-spin shrink-0" />
      <span className="font-medium">{progressText}</span>
    </div>
  );
}
