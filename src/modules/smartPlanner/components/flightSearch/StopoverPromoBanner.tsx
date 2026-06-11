// StopoverPromoBanner — a gentle, encouraging banner shown ABOVE the flight
// results when the traveller did NOT opt into a stopover.
//
// The idea: long-haul journeys are tiring, and breaking them into two legs with
// a few nights in a hub city can unlock real perks (cheaper hotel, no airport
// fees, free transit visa). This banner nudges the traveller to try it — and
// its single action simply re-runs the current search with the stopover option
// turned on, so the results list refreshes to include stopover offers.
//
// It's intentionally NOT a destructive or scary message, so we style it with the
// calm primary/info tone rather than a warning colour. It can be dismissed (the
// little ✕) for travellers who really just want a direct flight.

import { Sparkles, BedDouble, Wallet, Stamp, X } from "lucide-react";
import { Button } from "../../../../shared/components/ui/button";

type StopoverPromoBannerProps = {
  // Called when the traveller clicks the CTA — the parent re-runs the search
  // with the stopover option enabled.
  onEnableStopover: () => void;
  // Called when the traveller dismisses the banner (the ✕). Optional — if you
  // don't pass it, the dismiss button is hidden.
  onDismiss?: () => void;
};

// The three perks we surface as little "benefit chips". Each is just an icon +
// a short label. Keeping them as data (rather than hardcoded JSX) makes it easy
// to add/remove a perk later without touching the layout.
const PERKS = [
  { icon: BedDouble, label: "Discounted hotel stay" },
  { icon: Wallet, label: "No airport transfer fees" },
  { icon: Stamp, label: "Free transit visa" },
];

export function StopoverPromoBanner({
  onEnableStopover,
  onDismiss,
}: StopoverPromoBannerProps) {
  return (
    // The outer card: a soft primary-tinted surface with a matching subtle
    // border and rounded-xl corners to match the result cards. `relative` so the
    // dismiss button can sit in the top-right corner.
    <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5">

      {/* Dismiss (✕) — top-right, only rendered when onDismiss is provided. */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss stopover suggestion"
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-grey-light hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}

      {/* Layout: on small screens everything stacks; from md up the text block
          sits on the left and the CTA on the right, vertically centred. */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* ── Left: icon + headline + supporting copy + perk chips ─────────── */}
        <div className="flex items-start gap-3 pr-6 md:pr-0">

          {/* Leading icon in a rounded primary badge to anchor the message. */}
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={20} aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-2">
            {/* Headline — bold, foreground colour for contrast. */}
            <h3 className="text-base font-bold text-foreground leading-snug">
              Consider a stopover in your long journey
            </h3>

            {/* Supporting line — muted, explains the value in one sentence. */}
            <p className="text-sm text-muted-foreground leading-snug">
              Break this trip into two shorter flights with a few nights in a hub
              city along the way. You could unlock perks like:
            </p>

            {/* Perk chips — small icon + label pills that wrap on narrow screens. */}
            <ul className="flex flex-wrap gap-2 mt-1">
              {PERKS.map((perk) => {
                const Icon = perk.icon;
                return (
                  <li
                    key={perk.label}
                    className="flex items-center gap-1.5 rounded-full bg-card border border-primary/15 px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Icon size={14} className="text-primary" aria-hidden="true" />
                    {perk.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Right: the single action ─────────────────────────────────────
            Clicking this re-runs the current search with stopovers enabled.
            `shrink-0` stops the button squashing; `whitespace-nowrap` keeps the
            label on one line. No arrow icon on the CTA, per our conventions. */}
        <Button
          onClick={onEnableStopover}
          className="shrink-0 whitespace-nowrap self-start md:self-auto"
        >
          Show me stopover options
        </Button>
      </div>
    </div>
  );
}
