// RatingBlock.tsx
// Displays a guest review score with a colour-coded badge and a label like "Excellent".
// Adapted from the real TripBuilder frontend (tripbuilder-itinerary-frontend/RatingBlock.tsx).
//
// Key difference from production:
//   - Production uses a 0–5 scale (TrustYou scores converted from 0–100)
//   - This prototype uses a 0–10 scale (matching hotel.rating in HotelDetailPage)
//   - Labels and colours are hardcoded in English (no i18next)
//
// Usage:
//   <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />

import { Badge } from './ui/badge';

interface RatingBlockProps {
  reviewScore: number | undefined; // 0–10 scale
  reviewCount: number | undefined;
}

// Score thresholds on a 0–10 scale (production uses 0–5, so values are doubled).
// Colours are copied exactly from the real TripBuilder RatingBlock component.
const THRESHOLDS = [
  { min: 8.8, label: 'Excellent',  color: 'rgb(43, 170, 133)' }, // ≥4.4/5 in production
  { min: 8.2, label: 'Very Good',  color: 'rgb(190, 207, 0)'  }, // ≥4.1/5 in production
  { min: 7.6, label: 'Good',       color: 'rgb(255, 202, 0)'  }, // ≥3.8/5 in production
  { min: 7.2, label: 'Fair',       color: 'rgb(255, 149, 0)'  }, // ≥3.6/5 in production
] as const;

function getReviewMeta(score: number | undefined) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return { label: 'No rating', color: 'rgb(200, 200, 200)', display: 'N/A' };
  }

  const match = THRESHOLDS.find(({ min }) => score >= min);

  return {
    label: match?.label ?? 'Poor',
    color: match?.color ?? 'rgb(255, 88, 0)', // red-orange for Poor
    display: score,
  };
}

const RatingBlock = ({ reviewScore, reviewCount }: RatingBlockProps) => {
  const { label, color, display } = getReviewMeta(reviewScore);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Colour-coded score badge */}
      <Badge className="text-white text-xs font-bold" style={{ backgroundColor: color, borderColor: 'transparent' }}>
        {display}
      </Badge>

      {/* Label + review count stacked */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-foreground leading-tight">{label}</span>
        {reviewCount !== undefined && (
          <span className="text-xs text-muted-foreground leading-tight">
            {reviewCount.toLocaleString()} reviews
          </span>
        )}
      </div>
    </div>
  );
};

export default RatingBlock;
