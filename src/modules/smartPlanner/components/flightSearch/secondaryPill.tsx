// secondaryPill — shared styling for "secondary input" pills used across
// the Flights surfaces (Discovery's Flights tab, the post-search filter
// bar, and the Edit Search modal).
//
// The pattern is:
//   • h-8 desktop / h-[52px] mobile — compact on desktop, finger-friendly
//     on touch
//   • rounded-lg desktop / rounded-xl mobile
//   • White bg, border-border by default
//   • Hover → border flips to primary
//   • Open (Radix `data-state="open"`) → border AND text turn primary
//   • Leading 14px icon, inline value, trailing 13px ChevronDown that
//     rotates 180° when the trigger is open (via group-data)
//
// Why a single source: the user wants these triggers to feel like the
// same control wherever they appear. Hardcoding the class string in 3
// places makes future tweaks (e.g. design-system token swap) fragile.

import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";

// Base pill class — apply directly to any plain button or Radix
// `PopoverTrigger`. Includes the `group` marker that lets a nested
// chevron react to the open state.
export const PILL_CLASS =
  "group w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border border-border bg-white text-left text-sm md:text-xs font-semibold text-foreground transition-all hover:border-primary focus-visible:border-primary focus-visible:outline-none data-[state=open]:border-primary data-[state=open]:text-primary";

// SelectTrigger variant — shadcn's SelectTrigger ships with its own
// height (`data-[size=default]:h-9`) and a built-in trailing chevron.
// We use `!` to win over the variant height and `[&>svg:last-child]:hidden`
// to hide shadcn's chevron so our animated one (rendered inside
// `PillContent`) is the only one visible.
export const SELECT_PILL_CLASS = cn(
  PILL_CLASS,
  "!h-[52px] md:!h-8 [&>svg:last-child]:hidden",
);

// PillContent — the icon → value → rotating chevron layout that goes
// inside any pill trigger. Keep the inner structure consistent so triggers
// align pixel-for-pixel even when sitting next to each other in a row.
type PillContentProps = {
  icon: LucideIcon;
  value: ReactNode;
};
export function PillContent({ icon: Icon, value }: PillContentProps) {
  return (
    <>
      <Icon size={14} className="shrink-0" aria-hidden="true" />
      <span className="truncate flex-1 md:flex-initial">{value}</span>
      <ChevronDown
        size={13}
        className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
      />
    </>
  );
}
