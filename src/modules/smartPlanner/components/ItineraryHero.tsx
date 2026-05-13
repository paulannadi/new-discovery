// ─────────────────────────────────────────────────────────────────────────────
// ItineraryHero
//
// Full-bleed hero image with:
//   • A dark gradient overlay (so the title is readable)
//   • Trip metadata + editable-looking title pinned to the top-left
//   • A frosted "ticket capsule" pinned to the bottom (depart → return → Book)
//   • A subtle back button row above the image
//
// Closely mirrors the live HeroSection from tripbuilder-itinerary-frontend.
// We don't include the LanguageSwitcher / ShareItineraryModal / EditableTitle
// for now — those are out of scope per the plan.
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, ChevronLeft, Share } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../shared/components/loading";

interface ItineraryHeroProps {
  title: string;                       // e.g. "Individual trip to Bali"
  travelersLabel: string;              // e.g. "2 adults"
  nights: number;
  startDate: Date;
  endDate: Date;
  heroImageUrl: string;
  totalPriceLabel: string;             // e.g. "from €2,499"
  onBack: () => void;
}

export function ItineraryHero({
  title,
  travelersLabel,
  nights,
  startDate,
  endDate,
  heroImageUrl,
  totalPriceLabel,
  onBack,
}: ItineraryHeroProps) {
  return (
    <div>
      <div className="flex flex-col gap-5 py-5 max-w-5xl mx-auto">
        {/* Top row: just the back button (toggle lives in ViewModeToggle) */}
        <header className="flex items-center justify-start gap-4 px-4 lg:px-0 min-h-9">
          <Button
            variant="ghost"
            className="px-0 text-sm gap-1 hover:bg-transparent"
            onClick={onBack}
          >
            <ChevronLeft size={18} aria-hidden="true" />
            Back
          </Button>
        </header>

        {/* IMMERSIVE IMAGE CARD — fixed height, rounded on desktop, with overlays */}
        <div className="relative h-80 md:h-[420px] lg:rounded-3xl lg:border lg:border-grey-light overflow-hidden">
          <ImageWithPlaceholder
            src={heroImageUrl}
            alt={title}
            priority
            containerClassName="absolute inset-0 size-full"
            className="absolute inset-0 size-full object-cover"
          />

          {/* Dark gradient — heavier at top + bottom so overlay text is readable.
              `aria-hidden` because it's decorative. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/70 from-0% via-black/10 via-45% to-black/55 to-100%"
          />

          {/* TITLE OVERLAY — top-left of the image */}
          <div className="absolute inset-x-0 top-0 px-4 md:px-6 pt-5 md:pt-6 text-white">
            {/* Travelers + nights — small uppercase pre-title */}
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.08em] opacity-90 mb-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              <span>{travelersLabel}</span>
              <span aria-hidden className="mx-2">·</span>
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
            </p>

            {/* Title row — h1 + share icon */}
            <div className="flex items-start gap-1">
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {title}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 shrink-0 text-white hover:bg-white/15 hover:text-white"
                aria-label="Share itinerary"
              >
                <Share size={20} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* TICKET CAPSULE — frosted white pill pinned to the bottom of the image.
              Mobile: stacks vertically (dates row, then divider, then Book).
              Desktop: side-by-side with a vertical divider in the middle. */}
          <div className="absolute inset-x-3 md:inset-x-4 bottom-3 md:bottom-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 rounded-2xl border border-white/70 bg-white/95 backdrop-blur-md px-4 md:px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            {/* Dates cluster */}
            <div className="flex items-center gap-4 md:gap-6 md:flex-1 md:max-w-sm min-w-0">
              {/* Depart */}
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-grey">
                  Depart
                </span>
                <span className="mt-0.5 text-sm md:text-[15px] font-bold text-foreground">
                  {format(startDate, "dd MMM")}
                </span>
              </div>

              {/* Arrow + dashed line in the middle */}
              <div
                aria-hidden
                className="relative flex-1 min-w-[32px] border-t border-dashed border-grey-light"
              >
                <ArrowRight className="absolute -top-[11px] left-1/2 -translate-x-1/2 size-5 text-foreground" />
              </div>

              {/* Return */}
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-grey">
                  Return
                </span>
                <span className="mt-0.5 text-sm md:text-[15px] font-bold text-foreground">
                  {format(endDate, "dd MMM")}
                </span>
              </div>
            </div>

            {/* Mobile-only horizontal divider between rows */}
            <div aria-hidden className="md:hidden h-px w-full bg-grey-light" />

            {/* Book button + desktop vertical divider */}
            <div className="flex items-center gap-4 md:gap-6 justify-end md:ml-auto">
              <div aria-hidden className="hidden md:block w-px h-8 bg-grey-light" />
              <Button size="lg">Book · {totalPriceLabel}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
