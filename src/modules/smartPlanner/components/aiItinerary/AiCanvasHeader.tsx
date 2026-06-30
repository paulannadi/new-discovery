// AiCanvasHeader — compact hero card at the top of the AI canvas.
//
// Same visual vocabulary as SmartPlanner's ItineraryHero (immersive image,
// dark gradient, overlay title + travellers/nights pre-title, frosted
// "ticket capsule" with depart/return dates and a primary CTA) but at a
// smaller height (h-44) so the timeline below has room to breathe in the
// 60%-width canvas panel.

import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import { formatEuros } from "./useAiPlanState";

interface AiCanvasHeaderProps {
  title: string;
  travelersLabel: string;
  nights: number;
  startDate: Date;
  endDate: Date;
  heroImage: string;
  spent: number;
  budget: number;
  onCheckout: () => void;
}

export default function AiCanvasHeader({
  title,
  travelersLabel,
  nights,
  startDate,
  endDate,
  heroImage,
  spent,
  budget,
  onCheckout,
}: AiCanvasHeaderProps) {
  const overBudget = spent > budget;
  return (
    <div className="relative h-56 md:h-72 rounded-3xl border border-grey-light overflow-hidden mb-6">
      <ImageWithPlaceholder
        src={heroImage}
        alt={title}
        priority
        containerClassName="absolute inset-0 size-full"
        className="absolute inset-0 size-full object-cover"
      />

      {/* Dark gradient overlay — same recipe as ItineraryHero so the title
          reads clearly on top of any image. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/70 from-0% via-black/10 via-45% to-black/55 to-100%"
      />

      {/* Overlay title — top-left. Travelers/nights uppercase pre-title, big
          extrabold trip title underneath. */}
      <div className="absolute inset-x-0 top-0 px-4 md:px-5 pt-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.06em] opacity-90 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          {travelersLabel}
          <span aria-hidden className="mx-2">·</span>
          {nights} night{nights !== 1 ? "s" : ""}
        </p>
        <h1 className="text-xl md:text-2xl font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {title}
        </h1>
      </div>

      {/* Ticket capsule — frosted white pill pinned to the bottom edge.
          Carries depart/return dates, the running total, and the checkout
          CTA. Mirrors ItineraryHero's capsule pattern but slimmer to fit. */}
      <div className="absolute inset-x-3 md:inset-x-4 bottom-3 flex items-center gap-4 rounded-xl border border-white/70 bg-white/95 backdrop-blur-md px-3.5 md:px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        {/* Depart */}
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Depart
          </span>
          <span className="mt-0.5 text-xs md:text-sm font-bold text-foreground">
            {format(startDate, "dd MMM")}
          </span>
        </div>

        {/* Arrow + dashed line */}
        <div
          aria-hidden
          className="relative flex-1 min-w-[24px] border-t border-dashed border-grey-light"
        >
          <ArrowRight className="absolute -top-[10px] left-1/2 -translate-x-1/2 size-4 text-foreground" />
        </div>

        {/* Return */}
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Return
          </span>
          <span className="mt-0.5 text-xs md:text-sm font-bold text-foreground">
            {format(endDate, "dd MMM")}
          </span>
        </div>

        <div aria-hidden className="hidden md:block w-px h-7 bg-grey-light" />

        {/* Running total — read-only mini-meter so the user always sees the
            cost without scrolling to the bottom of the timeline. */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Total
          </span>
          <span
            className={[
              "mt-0.5 text-sm font-extrabold",
              overBudget ? "text-destructive" : "text-foreground",
            ].join(" ")}
          >
            {formatEuros(spent)}{" "}
            <span className="text-muted-foreground font-semibold">/ {formatEuros(budget)}</span>
          </span>
        </div>

        <Button size="sm" onClick={onCheckout} className="ml-auto md:ml-0">
          Continue
        </Button>
      </div>
    </div>
  );
}
