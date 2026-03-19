// ─────────────────────────────────────────────────────────────────────────────
// LiveSearchProgressBanner
//
// Shows a subtle progress indicator while live supplier queries are running.
// Appears below the package list and disappears when all results are in.
//
// The spinner + "Searching more suppliers…" message lets the user know
// there may be more results coming — so they don't click away too soon.
// ─────────────────────────────────────────────────────────────────────────────

interface LiveSearchProgressBannerProps {
  progress: { completed: number; total: number } | null;
}

export function LiveSearchProgressBanner({ progress }: LiveSearchProgressBannerProps) {
  // Format the progress text: "2 of 3 complete" or just "Searching…"
  const progressText = progress && progress.total > 0
    ? `Searching more suppliers… (${progress.completed} of ${progress.total} complete)`
    : 'Searching more suppliers…';

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f7ff] border border-[#bfdbfe] rounded-[12px] text-sm text-[#3b82f6] mt-2">
      {/* Spinning circle — the border-t-transparent trick creates the gap */}
      <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin flex-shrink-0" />
      <span className="font-medium">{progressText}</span>
    </div>
  );
}
