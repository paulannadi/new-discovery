// ─────────────────────────────────────────────────────────────────────────────
// ActivityCard
//
// One experience/excursion in the itinerary. Same overall shape as the
// AccommodationCard (image left, content right) but a bit lighter — activities
// don't have stars or check-in/out logic.
// ─────────────────────────────────────────────────────────────────────────────

import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../../shared/components/ui/button";
import { ImageWithPlaceholder } from "../../../../shared/components/loading";
import type { ActivityItem } from "../../utils/seedTimeline";

export function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div>
      {/* Date header — same style as flight / hotel cards */}
      <p className="font-semibold mb-3 md:mb-4 text-foreground">
        {format(item.date, "EEE, dd MMM yyyy")}
      </p>

      <div className="border border-border rounded-lg md:rounded-3xl shadow-sm">
        <div className="bg-card rounded-lg md:rounded-3xl grid md:grid-cols-[160px_1fr] lg:grid-cols-[270px_1fr] md:grid-rows-[200px]">
          <ImageWithPlaceholder
            src={item.image}
            alt={item.title}
            containerClassName="block w-full h-32 md:h-full max-md:rounded-t-lg md:rounded-l-3xl"
          />

          <div className="p-4 md:p-6 grid md:grid-cols-[1fr_160px] lg:grid-cols-[1fr_220px]">
            {/* LEFT: activity details */}
            <div className="flex flex-col gap-4 justify-between md:border-r md:pr-6 border-border">
              <div className="space-y-1.5">
                <h3 className="font-bold text-foreground leading-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </div>

              {/* Bottom row: duration + location | price */}
              <div className="flex justify-between items-end gap-4">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} aria-hidden="true" />
                    {item.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} aria-hidden="true" />
                    {item.location}
                  </span>
                </div>
                {item.price && (
                  <div className="text-right">
                    <div className="text-xs text-grey">From</div>
                    <div className="text-base font-bold text-foreground">{item.price}</div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: action column */}
            <div className="flex flex-row-reverse md:flex-col justify-between items-center md:items-end border-t border-border pt-5 mt-5 md:border-0 md:pt-0 md:mt-0">
              <Button variant="outline" className="px-4">
                Change
              </Button>
              <Button variant="link" size="sm" className="px-0">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
