// StarRating.tsx
// Low-level component that draws a row of filled, half, and empty stars.
// Copied from the real TripBuilder frontend (tripbuilder-itinerary-frontend).
//
// You won't use this directly — use AccommodationStar instead,
// which handles the math of converting a number like "4.5" into
// the right mix of full/half/empty stars.

import { Star, StarHalf } from 'lucide-react';

type StarRatingProps = {
  fullStars: number;      // how many completely filled stars to show
  hasHalfStar: boolean;   // whether to show one half-filled star
  emptyStars: number;     // how many empty (outline) stars to show
  offerId?: string;       // used to generate unique React keys
  offerName: string;      // used as fallback for unique keys
  size?: number;          // icon size in px (default: 14)
};

const StarRating = ({
  fullStars,
  hasHalfStar,
  emptyStars,
  offerId,
  offerName,
  size = 14,
}: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Filled stars */}
      {Array.from({ length: fullStars }, (_, i) => `star-full-${offerId || offerName}-${i}`).map(
        (starKey) => (
          <Star key={starKey} fill="var(--warning)" stroke="transparent" size={size} />
        )
      )}

      {/* Half star — layered: grey background star + golden half star on top */}
      {hasHalfStar && (
        <div key="star-half" className="relative" style={{ width: size, height: size }}>
          <Star
            fill="var(--grey-light)"
            stroke="transparent"
            size={size}
            className="absolute inset-0"
          />
          <StarHalf
            fill="var(--warning)"
            stroke="transparent"
            size={size}
            className="absolute inset-0"
          />
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => `star-empty-${offerId || offerName}-${i}`).map(
        (starKey) => (
          <Star key={starKey} fill="var(--grey-light)" stroke="transparent" size={size} />
        )
      )}
    </div>
  );
};

export default StarRating;
