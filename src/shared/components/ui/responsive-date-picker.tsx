"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "./utils";
import { Calendar } from "./calendar";
import { useIsMobile } from "./use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "./drawer";

/**
 * ResponsiveDatePicker
 * --------------------
 * One reusable calendar for the whole app. It owns the *presentation* of a date
 * picker so every surface behaves the same:
 *
 *   • Desktop (≥768px): the calendar opens in a dropdown anchored under the
 *     trigger button — the way most of our search bars already worked.
 *   • Mobile (<768px): the calendar opens in a bottom **drawer** that slides up,
 *     fills the screen width, and can be swiped away — the Holidays behaviour,
 *     which is far nicer to tap on a phone than a cramped dropdown.
 *
 * It does NOT own the trigger button — you pass your existing button in via the
 * `trigger` prop, so each surface keeps its own look. It also does NOT own the
 * open/closed state — that's controlled via `open` + `onOpenChange`, which slots
 * straight into the `openPanel === "dates"` pattern the pages already use.
 *
 * By default it renders our shared, theme-token `Calendar`. Any leftover props
 * (mode, selected, onSelect, numberOfMonths, disabled, defaultMonth, modifiers,
 * components, …) are forwarded to it — so this single component covers single
 * dates, ranges, AND the custom price-per-day calendar. If you need something
 * other than a plain calendar in the panel (e.g. Holidays' mode toggle + month
 * grid), pass it as `children` and the Calendar is skipped.
 */

// Props we own ourselves. Everything else is forwarded to <Calendar>.
type OwnProps = {
  /** Is the panel open? Controlled by the parent (e.g. `openPanel === "dates"`). */
  open: boolean;
  /** Called when the panel should open/close (outside click, Esc, swipe-down). */
  onOpenChange: (open: boolean) => void;
  /** Your existing trigger button. Its own onClick should toggle `open`. */
  trigger: React.ReactNode;
  /** Title shown in the mobile drawer header. */
  title?: string;
  /** Desktop dropdown alignment relative to the trigger. */
  align?: "left" | "right";
  /** Extra classes for the wrapper (positioning context for the dropdown). */
  className?: string;
  /** Override/extend the desktop dropdown panel classes. */
  panelClassName?: string;
  /**
   * On mobile, stretch the calendar's day cells to fill the drawer width.
   * Default true (nice big tap targets). Set false when the panel content
   * manages its own cell sizing — e.g. the Holidays price-per-day calendar,
   * whose cells are deliberately taller to fit the price text.
   */
  fillMobileWidth?: boolean;
  /**
   * Custom panel content. When provided, it replaces the default <Calendar> —
   * used by Holidays, which needs a mode toggle + price cells + month grid.
   */
  children?: React.ReactNode;
};

// The full prop type = our props + all Calendar (react-day-picker) props.
// We intersect (not Omit) on purpose: react-day-picker's props are a
// discriminated union (mode="single" vs "range" change the shape of `selected`
// / `onSelect`). Omit-ing would flatten that union and break those types, so we
// keep the raw intersection — `children` is compatible in both halves.
type ResponsiveDatePickerProps = OwnProps &
  React.ComponentProps<typeof Calendar>;

export function ResponsiveDatePicker({
  open,
  onOpenChange,
  trigger,
  title = "Select dates",
  align = "left",
  className,
  panelClassName,
  fillMobileWidth = true,
  children,
  ...calendarProps
}: ResponsiveDatePickerProps) {
  const isMobile = useIsMobile();

  // Ref on the wrapper so we can detect clicks *outside* it and close (desktop).
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // The panel content: custom children if given, otherwise our shared Calendar.
  const panel = children ?? <Calendar {...calendarProps} />;

  // ── Desktop: close on outside-click and on Escape ─────────────────────────
  // The drawer handles its own dismissal on mobile, so this only runs on
  // desktop and only while open. The trigger lives *inside* wrapperRef, so
  // clicking it never counts as "outside" (no close-then-reopen flicker).
  React.useEffect(() => {
    if (isMobile || !open) return;

    function onPointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, open, onOpenChange]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* The caller's own button. Its onClick toggles `open`. */}
      {trigger}

      {/* ── Desktop: dropdown anchored under the trigger ─────────────────── */}
      {!isMobile && open && (
        <div
          className={cn(
            // Float just below the trigger. max-h + scroll so a calendar near
            // the bottom of the screen becomes scrollable instead of clipping.
            "absolute top-[calc(100%+8px)] z-50 bg-card rounded-xl shadow-xl border border-border",
            "animate-in fade-in zoom-in-95 duration-150",
            "max-h-[calc(100vh-180px)] overflow-y-auto",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {panel}
        </div>
      )}

      {/* ── Mobile: bottom drawer (the Holidays behaviour) ───────────────── */}
      {/* open/onOpenChange map straight to the parent's panel state, so swiping
          the drawer down or tapping the overlay closes it with no extra wiring. */}
      {isMobile && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between pb-0">
              <DrawerTitle className="text-sm font-bold text-foreground">
                {title}
              </DrawerTitle>
              <DrawerClose asChild>
                <button className="text-muted-foreground p-1" aria-label="Close">
                  <X size={18} aria-hidden="true" />
                </button>
              </DrawerClose>
            </DrawerHeader>
            {/* Scroll if the calendar is taller than the drawer. The `rdp-fill`
                class lets the calendar's day cells stretch to fill the phone
                width (see the scoped style below) so it feels roomy to tap.
                Skipped when the content manages its own sizing (fillMobileWidth). */}
            <div className={cn("overflow-y-auto", fillMobileWidth && "rdp-fill")}>
              {panel}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Mobile-only sizing: make react-day-picker's day cells fill the drawer
          width evenly. 32px ≈ the drawer's horizontal padding; ÷7 spreads the
          seven weekday columns across the full width. Scoped to `.rdp-fill` so
          it never affects desktop calendars. */}
      {isMobile && fillMobileWidth && (
        <style>{`
          .rdp-fill .rdp-root {
            --rdp-day-width: calc((100vw - 32px) / 7);
            --rdp-day-height: calc((100vw - 32px) / 7);
            --rdp-day_button-width: calc((100vw - 32px) / 7 - 2px);
            --rdp-day_button-height: calc((100vw - 32px) / 7 - 2px);
          }
        `}</style>
      )}
    </div>
  );
}
