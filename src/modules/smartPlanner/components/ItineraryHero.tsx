// ─────────────────────────────────────────────────────────────────────────────
// ItineraryHero
//
// Full-bleed hero image with:
//   • A dark gradient overlay (so the title is readable)
//   • Trip metadata + editable-looking title pinned to the top-left
//   • A cluster of 3 "inverted" icon buttons pinned to the top-right
//       1. Globe   → opens the language menu (later: + currency)
//       2. Map     → opens map mode (takeover)
//       3. More(…) → "Share itinerary" + "Expert mode"
//   • A frosted "ticket capsule" pinned to the bottom (depart → return → Book)
//
// The icon buttons sit on top of the image, so they use a translucent dark
// backdrop + white icons ("inverted" style) so they stay visible regardless
// of what photo is behind them.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Globe,
  Map as MapIcon,
  MoreHorizontal,
  Pencil,
  Share2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import { ImageWithPlaceholder } from "../../../shared/components/loading";
import { cn } from "../../../shared/components/ui/utils";

interface ItineraryHeroProps {
  title: string;                       // e.g. "Individual trip to Bali"
  travelersLabel: string;              // e.g. "2 adults"
  nights: number;
  startDate: Date;
  endDate: Date;
  heroImageUrl: string;
  totalPriceLabel: string;             // e.g. "from €2,499"
  // Map button — opens the new map-mode takeover. Optional so the hero still
  // renders if a parent hasn't wired it up yet (in that case the button is a
  // no-op rather than crashing).
  onOpenMap?: () => void;
  // More menu actions — both optional for the same reason as onOpenMap.
  onShareItinerary?: () => void;
  onToggleExpertMode?: () => void;
}

// Language options shown in the Globe dropdown.
// Hard-coded for the prototype — the real app pulls this from i18next config.
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pl", label: "Polski" },
  { code: "da", label: "Dansk" },
];

export function ItineraryHero({
  title,
  travelersLabel,
  nights,
  startDate,
  endDate,
  heroImageUrl,
  totalPriceLabel,
  onOpenMap,
  onShareItinerary,
  onToggleExpertMode,
}: ItineraryHeroProps) {
  // Currently-selected language — purely visual state for the prototype.
  // In the real app this would come from i18next + a user-prefs store.
  const [language, setLanguage] = useState("en");

  return (
    <div>
      <div className="flex flex-col gap-5 py-5 max-w-5xl mx-auto">
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

          {/* TITLE OVERLAY — top-left of the image.
              `pr-32` on the right pushes title text away from the icon button
              cluster on small screens so they don't collide. */}
          <div className="absolute inset-x-0 top-0 px-4 md:px-6 pt-5 md:pt-6 text-white pr-32 md:pr-40">
            {/* Travelers + nights — small uppercase pre-title */}
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.08em] opacity-90 mb-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              <span>{travelersLabel}</span>
              <span aria-hidden className="mx-2">·</span>
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
            </p>

            {/* Title row — h1 + edit-pencil icon (Share has moved to the More menu) */}
            <div className="flex items-start gap-1">
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {title}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 shrink-0 text-white hover:bg-white/15 hover:text-white"
                aria-label="Edit trip title"
              >
                <Pencil size={20} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* INVERTED ICON BUTTONS — top-right cluster.
              Translucent dark backdrop so they stay legible on any image. */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1.5">
            {/* 1. LANGUAGE / GLOBE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Change language"
                  className={cn(
                    // Layout: rounded-square icon button, white icon, dark translucent bg.
                    "flex items-center justify-center size-10 rounded-xl",
                    "bg-black/30 hover:bg-black/45 backdrop-blur-sm",
                    "text-white transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  )}
                >
                  <Globe className="size-5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {LANGUAGES.map((lang) => {
                  const selected = language === lang.code;
                  return (
                    <DropdownMenuItem
                      key={lang.code}
                      onSelect={() => setLanguage(lang.code)}
                      className="pl-2"
                    >
                      {/* Check on the left for the currently-selected language.
                          Empty slot of the same width keeps non-selected rows
                          aligned with the selected one. */}
                      <span className="flex size-4 items-center justify-center text-primary">
                        {selected ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span>{lang.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. MAP — opens the map-mode takeover. */}
            <button
              type="button"
              onClick={onOpenMap}
              aria-label="Open map view"
              className={cn(
                "flex items-center justify-center size-10 rounded-xl",
                "bg-black/30 hover:bg-black/45 backdrop-blur-sm",
                "text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              )}
            >
              <MapIcon className="size-5" aria-hidden="true" />
            </button>

            {/* 3. MORE MENU — Share itinerary, Expert mode. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className={cn(
                    "flex items-center justify-center size-10 rounded-xl",
                    "bg-black/30 hover:bg-black/45 backdrop-blur-sm",
                    "text-white transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                  )}
                >
                  <MoreHorizontal className="size-5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuItem onSelect={() => onShareItinerary?.()}>
                  <Share2 className="size-4" aria-hidden="true" />
                  <span>Share itinerary</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onToggleExpertMode?.()}>
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span>Expert mode</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
