// ─────────────────────────────────────────────────────────────────────────────
// AccommodationCard
//
// A single hotel / lodging entry. Styled to match the live TripBuilder
// AccommodationCard: image on the left (desktop), content + actions on the right.
//
// Mobile: image is full-width on top, content stacks below.
// Desktop: 270px image column | content column with vertical divider before actions.
// ─────────────────────────────────────────────────────────────────────────────

import { MapPin, Star } from "lucide-react";
import { format, addDays } from "date-fns";
import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import type { AccommodationItem } from "../../utils/seedTimeline";

export function AccommodationCard({ item }: { item: AccommodationItem }) {
  const { hotel, nights, checkIn, showPrice = true } = item;
  const checkOut = addDays(checkIn, nights);

  return (
    <div>
      {/* Date range header — sits outside the card, like live SmartPlanner */}
      <p className="font-semibold mb-3 md:mb-4 text-foreground">
        {format(checkIn, "EEE, dd MMM yyyy")} – {format(checkOut, "dd MMM yyyy")}
        <span className="text-muted-foreground font-normal">
          {" · "}
          {nights} night{nights !== 1 ? "s" : ""}
        </span>
      </p>

      <div className="border border-border rounded-xl shadow-sm">
        <div className="bg-card rounded-xl grid md:grid-cols-[160px_1fr] lg:grid-cols-[270px_1fr] md:grid-rows-[250px]">
          {/* Hotel image — full width on mobile, fixed column on desktop.
              ImageWithPlaceholder reserves the space + lazy-loads. */}
          <ImageWithPlaceholder
            src={hotel.image}
            alt={hotel.name}
            containerClassName="block w-full h-32 md:h-full max-md:rounded-t-xl md:rounded-l-xl"
          />

          {/* Content area — two columns on md+: info | actions */}
          <div className="p-4 md:p-6 grid md:grid-cols-[1fr_160px] lg:grid-cols-[1fr_220px]">
            {/* LEFT: hotel info */}
            <div className="flex flex-col gap-6 justify-between md:border-r md:pr-6 border-border">
              <div className="space-y-1">
                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-warning text-warning"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {/* Hotel name */}
                <h3 className="font-bold text-foreground leading-tight">{hotel.name}</h3>
                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={12} className="shrink-0" aria-hidden="true" />
                  {hotel.location}
                </div>
                {/* Room info — uses the real room name when the user picked one
                  (Hotel detail flow) or one was specified on the tour stop;
                  falls back to a generic label otherwise. */}
                <p className="text-sm text-foreground">
                  <span className="font-bold">1</span>{" "}
                  {hotel.roomType ?? "Standard Room"}
                </p>
              </div>

              {/* Bottom row: meal/cancellation info | "Show map" link.
                  Uses real board info when available, otherwise generic strings. */}
              <div className="flex justify-between items-end gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {hotel.boardType ?? "Breakfast included"}
                  </p>
                  <p className="text-xs text-success font-semibold">Free cancellation</p>
                </div>
                {showPrice && hotel.price > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="text-base font-bold text-foreground">
                      €{hotel.price}/night
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: action column.
                Mobile: row, separated by top border.
                Desktop: stacked, right-aligned. */}
            <div className="flex flex-row-reverse md:flex-col justify-between items-center md:items-end border-t border-border pt-5 mt-5 md:border-0 md:pt-0 md:mt-0">
              <Button variant="outline" className="px-4">
                Change Hotel
              </Button>
              <Button variant="link" size="sm" className="px-0">
                View Room Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
