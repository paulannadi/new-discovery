// AccommodationStar.tsx
// Smart wrapper around StarRating that converts a raw number (e.g. 4.5)
// into the correct number of full, half, and empty stars.
//
// Copied from the real TripBuilder frontend (tripbuilder-itinerary-frontend).
//
// Usage:
//   <AccommodationStar rating={hotel.stars} offerName={hotel.name} size={16} />
//
// Props:
//   rating    — the star rating, e.g. 4 or 4.5 (number or string, both work)
//   offerName — the hotel name (used for accessibility keys)
//   offerId   — optional hotel ID (also used for keys)
//   size      — icon size in px (default: 14)

import { useMemo } from 'react';
import StarRating from './StarRating';

type AccommodationStarProps = {
  rating?: string | number;
  offerName: string;
  offerId?: string;
  size?: number;
};

const AccommodationStar = ({
  rating,
  offerName,
  offerId = '',
  size = 14,
}: AccommodationStarProps) => {
  // Convert the raw rating number into full/half/empty star counts.
  // This runs only when `rating` changes, thanks to useMemo.
  const starRating = useMemo(() => {
    if (!rating) return null;

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum <= 0) return null;

    const floored = Math.floor(ratingNum);      // e.g. 4 for 4.5
    const decimal = ratingNum - floored;        // e.g. 0.5 for 4.5

    let fullStars = floored;
    let hasHalfStar = false;

    // Rounding rules (matches TripBuilder production logic):
    //   decimal >= 0.75  → round up to a full star
    //   decimal >= 0.25  → show a half star
    //   decimal < 0.25   → round down (ignore the decimal)
    if (decimal >= 0.75) {
      fullStars += 1;
    } else if (decimal >= 0.25) {
      hasHalfStar = true;
    }

    // Always show 5 stars total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return { fullStars, hasHalfStar, emptyStars };
  }, [rating]);

  // If rating is missing or invalid, render nothing
  if (!starRating) return null;

  return (
    <StarRating
      fullStars={starRating.fullStars}
      hasHalfStar={starRating.hasHalfStar}
      emptyStars={starRating.emptyStars}
      offerId={offerId}
      offerName={offerName}
      size={size}
    />
  );
};

export default AccommodationStar;
