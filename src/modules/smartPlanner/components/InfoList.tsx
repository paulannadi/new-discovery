// ─────────────────────────────────────────────────────────────────────────────
// InfoList — bullet list used by the Highlights / Included / Excluded sections
// on detail pages (TourDetailPage and ActivityDetailPage).
//
// Three visual variants drive the bullet icon:
//   • "highlight" / "check" → green check on a soft success background
//   • "cross"               → red X on a soft danger background
//
// Layout: 2 columns on md+, single column on mobile.
// ─────────────────────────────────────────────────────────────────────────────

import { Check, X } from "lucide-react";
import { cn } from "../../../shared/components/ui/utils";

interface InfoListProps {
  title: string;
  items: string[];
  variant: "highlight" | "check" | "cross";
}

export function InfoList({ title, items, variant }: InfoListProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-bold text-foreground">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                variant === "cross" ? "bg-danger/10" : "bg-success/10"
              )}
            >
              {variant === "cross" ? (
                <X size={11} className="text-danger" aria-hidden="true" />
              ) : (
                <Check size={11} className="text-success" aria-hidden="true" />
              )}
            </div>
            <p className="text-sm text-foreground leading-normal">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
