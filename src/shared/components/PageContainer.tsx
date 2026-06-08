import * as React from "react";
import { cn } from "./ui/utils";

/**
 * PageContainer — the single source of truth for desktop content width.
 *
 * Smart Planner pages fall into three width "tiers". Instead of hard-coding a
 * max-width on every page (which is how they drifted out of sync), each page
 * wraps its content in <PageContainer tier="..."> and the width lives here.
 * Change a number in this file once and every page in that tier follows.
 *
 * The component owns ONLY the width + centering. Horizontal/vertical padding
 * stays on each page (passed via className), because padding legitimately
 * differs between a map-heavy list page and a reading-focused detail page.
 */

// The three canonical content widths. Edit here to re-tune a whole tier.
const TIER_MAX_WIDTH = {
  wide: "max-w-[1920px]", // list pages with a side map (Activity / Holiday / Hotel lists)
  standard: "max-w-[1280px]", // detail & browse pages (Activity / Hotel / Tour / Package / Discovery)
  narrow: "max-w-[1024px]", // focused single-column flows (Smart Planner, Flight list)
} as const;

type Tier = keyof typeof TIER_MAX_WIDTH;

// Extends the normal <div> props, so you can still pass id, onClick, etc. —
// it behaves like a div that happens to cap its own width.
interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which width tier this content belongs to. */
  tier: Tier;
  /**
   * Which HTML element to render. Defaults to "div", but pass "main",
   * "header", "section" etc. to keep the page semantic (better for
   * accessibility) instead of nesting an extra wrapper div.
   */
  as?: React.ElementType;
}

// forwardRef lets a parent attach a ref to the underlying element — needed by
// pages that measure the container's size/position (e.g. a sticky filter bar).
export const PageContainer = React.forwardRef<HTMLElement, PageContainerProps>(
  function PageContainer({ tier, as: Component = "div", className, children, ...props }, ref) {
    return (
      <Component
        ref={ref}
        className={cn(
          // w-full lets the column fill the viewport up to its cap; mx-auto centers it.
          "w-full mx-auto",
          TIER_MAX_WIDTH[tier],
          // Caller-supplied classes (padding, flex layout, etc.) come last so they win.
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
