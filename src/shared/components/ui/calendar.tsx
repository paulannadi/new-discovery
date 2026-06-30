"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ChevronProps } from "react-day-picker";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  style,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      // Theming, NOT layout. react-day-picker v9 lays out its own grid via the
      // bundled `react-day-picker/dist/style.css` (imported by the consuming
      // pages). We only remap its CSS variables to our design tokens so every
      // calendar is on-brand — token-based per §1.1, never hardcoded hex.
      //
      // ⚠️ Do NOT re-add a Tailwind `classNames` map here unless it uses v9 key
      // names. The previous map used v8 keys (`table`/`row`/`cell`/`day`…); in
      // v9 the `day` key targets the grid *cell*, so button styles landed on the
      // cell and collapsed the 7-column month into a broken wrap. Letting v9 own
      // the layout is what keeps it correct. `...style` last so callers can override.
      style={{
        "--rdp-accent-color": "var(--primary)",
        "--rdp-accent-background-color":
          "color-mix(in srgb, var(--primary) 10%, transparent)",
        "--rdp-day_button-border-radius": "var(--radius-md)",
        ...style,
      } as React.CSSProperties}
      // Pass through any caller-supplied classNames (none by default).
      classNames={classNames}
      components={{
        // react-day-picker v9 uses a single Chevron component instead of IconLeft/IconRight.
        // The `orientation` prop tells us which direction to point the arrow.
        //
        // `text-muted-foreground` makes the arrows a neutral grey (matching the ChevronDown
        // on our field triggers). `style={{ fill: "none" }}` is the important bit:
        // rdp's own stylesheet sets `.rdp-chevron { fill: var(--rdp-accent-color) }`,
        // which would fill these stroked lucide arrows with our blue --primary and
        // leave a blue tint inside them. An inline style beats that class rule, so
        // the arrows stay clean (stroke only, no blue fill).
        Chevron: ({ orientation, className, ...props }: ChevronProps) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4 text-muted-foreground", className)} {...props} style={{ fill: "none" }} />
          ) : (
            <ChevronRight className={cn("size-4 text-muted-foreground", className)} {...props} style={{ fill: "none" }} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
