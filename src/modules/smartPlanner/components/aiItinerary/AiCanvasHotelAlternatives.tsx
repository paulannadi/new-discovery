// AiCanvasHotelAlternatives — the in-canvas drawer that opens when the user
// taps "Show cheaper hotel options" in the chat. Three card-shaped pickers
// drawn from the same `HOTEL_ALTS` pool the plan state uses, so tapping one
// produces a clean swap of the accommodation card on the timeline.

import { Sparkles, Star, X } from "lucide-react";

import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import { HOTEL_ALTS } from "./useAiPlanState";

interface AiCanvasHotelAlternativesProps {
  onPick: (idx: number) => void;
  onClose: () => void;
}

export default function AiCanvasHotelAlternatives({
  onPick,
  onClose,
}: AiCanvasHotelAlternativesProps) {
  return (
    <div className="bg-card border border-primary rounded-xl shadow-md p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
          AI also suggested · tap one to swap
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={onClose}
          aria-label="Close alternatives"
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {HOTEL_ALTS.map((alt, i) => (
          <button
            key={alt.hotel.name}
            type="button"
            onClick={() => onPick(i)}
            className="bg-grey-lightest border border-border rounded-xl p-3 flex flex-col gap-1.5 items-start text-left cursor-pointer hover:border-primary transition-colors"
          >
            <ImageWithPlaceholder
              src={alt.hotel.image}
              alt={alt.hotel.name}
              containerClassName="h-14 w-full"
              rounded="rounded-lg"
              className="size-full object-cover"
            />
            <div className="flex items-center gap-0.5 -my-0.5">
              {Array.from({ length: alt.hotel.stars }).map((_, idx) => (
                <Star
                  key={idx}
                  className="size-3 fill-warning text-warning"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="text-xs font-extrabold">{alt.hotel.name}</div>
            <div className="text-[11px] text-grey">{alt.hotel.location}</div>
            <div className="text-xs font-extrabold text-primary">
              €{alt.pricePerNight}/nt
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
