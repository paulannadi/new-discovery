// ─────────────────────────────────────────────────────────────────────────────
// StreamingStatusBanner
//
// Generalised version of the original LiveSearchProgressBanner.
//
// The doc's "Streaming Results" pattern (3s–10s tier): when results come in
// over time from multiple sources, show what's already arrived and put a
// banner below the list explaining more is on the way.
//
// What this component handles:
//   • Optional progress counter ("2 of 3 complete")
//   • Custom message — so the same component works for hotels, flights,
//     activities, packages, or any future streaming context.
//   • Live region (aria-live="polite") so screen readers announce updates
//     without interrupting whatever the user is doing.
//   • Subtle entrance/exit so it doesn't push content around (CLS-friendly).
//
// This replaces the old LiveSearchProgressBanner — the old component only
// supported supplier searches with a hardcoded copy string.
// ─────────────────────────────────────────────────────────────────────────────

import { Loader2 } from "lucide-react";

interface StreamingStatusBannerProps {
  // Set to false (or null) to hide the banner entirely. Easier than wrapping
  // every usage in a conditional.
  isStreaming: boolean;
  // Optional progress counter. Omit if the source can't report progress
  // (e.g. a single supplier query with no batch info).
  progress?: { completed: number; total: number } | null;
  // Custom copy. Defaults to the supplier-search wording so the existing
  // package list keeps working without any code change.
  message?: string;
  // Higher-context message displayed when wait crosses the 10s threshold.
  // Optional — pass it from the parent if you track elapsed time.
  longWaitMessage?: string;
  isLongWait?: boolean;
}

export function StreamingStatusBanner({
  isStreaming,
  progress,
  message = "Searching more suppliers…",
  longWaitMessage,
  isLongWait,
}: StreamingStatusBannerProps) {
  if (!isStreaming) return null;

  // Pick which copy to show. If we've been waiting > 10s and the parent has
  // supplied a longer-wait message, swap it in to reassure the user.
  const baseMessage = isLongWait && longWaitMessage ? longWaitMessage : message;

  // Append the progress counter when we have one. Keeping this here (not in
  // the parent) means every list page formats progress identically.
  const text = progress && progress.total > 0
    ? `${baseMessage} (${progress.completed} of ${progress.total} complete)`
    : baseMessage;

  return (
    <div
      role="status"
      aria-live="polite"
      // Uses the design system's primary blue (#2681ff) at low opacity for the
      // background and border, full strength for text + spinner. The original
      // LiveSearchProgressBanner used `bg-info/...` but `--info` isn't a token
      // in this theme, so those classes resolved to nothing and the banner
      // rendered unstyled.
      className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/30 rounded-xl text-sm text-primary mt-2"
    >
      {/* The spinner reinforces "still working" — pairs with the text rather
          than replacing it (the doc warns against context-free spinners). */}
      <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
      <span className="font-medium">{text}</span>
    </div>
  );
}
