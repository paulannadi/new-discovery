// ─────────────────────────────────────────────────────────────────────────────
// InfoList — bullet list used by the Highlights / Included / Excluded sections
// on detail pages (TourDetailPage and ActivityDetailPage).
//
// Three visual variants drive the bullet icon (16px, no background):
//   • "highlight" → primary-coloured star
//   • "check"     → success-coloured check
//   • "cross"     → red X
//
// Layout: 2 columns on md+, single column on mobile.
// ─────────────────────────────────────────────────────────────────────────────

import { Check, X, CircleCheckBig } from "lucide-react";

interface InfoListProps {
  // Optional: when the section already has a heading above it (as on
  // ActivityDetailPage), omit this so we don't render a duplicate subtitle.
  title?: string;
  items: string[];
  variant: "highlight" | "check" | "cross";
}

export function InfoList({ title, items, variant }: InfoListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Only render the subtitle when one is passed */}
      {title && <p className="text-base font-bold text-foreground">{title}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            {/* Bullet icon — no background circle, 16px (w-4 h-4).
                highlight → primary star · check → success check · cross → red X */}
            {variant === "cross" ? (
              <X className="w-4 h-4 text-red-600 shrink-0 mt-0.75" aria-hidden="true" />
            ) : variant === "highlight" ? (
              <CircleCheckBig className="w-4 h-4 text-foreground shrink-0 mt-0.75" aria-hidden="true" />
            ) : (
              <Check className="w-4 h-4 text-success shrink-0 mt-0.75" aria-hidden="true" />
            )}
            <p className="text-sm text-foreground leading-normal">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
