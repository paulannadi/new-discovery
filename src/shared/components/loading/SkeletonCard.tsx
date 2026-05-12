// ─────────────────────────────────────────────────────────────────────────────
// SkeletonCard
//
// A pre-composed skeleton that mirrors the layout of a standard product card
// (image strip + title + meta rows + price/CTA column). Use it while a list
// of cards is loading so the page reserves the right amount of space —
// preventing layout shift when real content arrives (CLS rule).
//
// The doc's rules applied here:
//   • Match the layout exactly — same image height, same column structure as
//     PackageCard / HotelCard / TourCard.
//   • Rounded rectangles, no wiggly text-shaped lines.
//   • Pulse animation comes from the underlying <Skeleton /> primitive.
//   • Never skeleton interactive elements — there's no fake "View details"
//     button skeleton because it would look clickable.
//
// Variant prop lets list pages tune the layout for their card type without
// each page having to maintain its own bespoke skeleton.
// ─────────────────────────────────────────────────────────────────────────────

import { Skeleton } from "../ui/skeleton";
import { cn } from "../ui/utils";

interface SkeletonCardProps {
  // "horizontal" — image strip on the left, content on the right (PackageCard, HotelCard)
  // "vertical"   — image on top, content below (TourCard, ActivityCard, gallery views)
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function SkeletonCard({ variant = "horizontal", className }: SkeletonCardProps) {
  if (variant === "vertical") {
    return (
      <div
        // aria-busy tells screen readers the region is loading. We pair it with
        // role="status" so assistive tech treats this as a live region update.
        role="status"
        aria-busy="true"
        aria-label="Loading content"
        className={cn(
          "bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col",
          className,
        )}
      >
        {/* Image — fixed aspect-ratio reserves space so nothing jumps when the
            real photo loads. Matches TourCard/ActivityCard image proportions. */}
        <Skeleton className="w-full aspect-[4/3] rounded-none" />

        <div className="p-4 flex flex-col gap-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />
          {/* Meta row (location, duration, etc.) */}
          <Skeleton className="h-4 w-1/2" />
          {/* Two-line description */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          {/* Price row */}
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  // Horizontal — same dimensions as PackageCard (200px image strip, 4-line content)
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden shadow-sm",
        "flex flex-col md:flex-row",
        className,
      )}
    >
      {/* Image — full width on mobile, 260px fixed on desktop (matches PackageCard) */}
      <Skeleton className="h-[200px] md:h-auto md:w-[260px] md:self-stretch shrink-0 rounded-none" />

      <div className="flex-1 p-4 lg:p-6 flex flex-col md:flex-row gap-4">
        {/* Left column: title + meta lines */}
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/5" />
          {/* Amenity pills */}
          <div className="flex flex-wrap gap-2 mt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Right column: price block. We deliberately don't skeleton a button —
            an obvious skeleton-button looks clickable and confuses people. */}
        <div className="shrink-0 flex flex-col items-end justify-end gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
