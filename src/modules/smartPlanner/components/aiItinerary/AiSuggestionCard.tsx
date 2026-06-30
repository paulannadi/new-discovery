// AiSuggestionCard — one tile in the generative-canvas grid.
//
// It's a *chooser* card (country / city / template), not a full product card:
// a photo, a title, a one-line description, and a small meta footer. The whole
// card is a button — tapping it pushes the choice into the conversation and
// advances the canvas (see `pickSuggestion` in useAiPlanState).
//
// Motion details (via the "make-interfaces-feel-better" principles):
//   • Enter: inherits a staggered fade-up + de-blur from the parent grid
//     (the card just declares the `variants`; the parent orchestrates timing).
//   • Hover: a subtle 2px lift.
//   • Press: scale to 0.96 — interruptible, so releasing mid-press eases back.
//   • All gestures are skipped when the user prefers reduced motion.

import { Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { ImageWithPlaceholder } from "../../../../shared/components/loading/ImageWithPlaceholder";
import { Badge } from "../../../../shared/components/ui/badge";
import { cn } from "../../../../shared/components/ui/utils";
import type { SuggestionCard } from "./useAiPlanState";

interface AiSuggestionCardProps {
  card: SuggestionCard;
  onSelect: (id: string) => void;
  // Enter-animation variants handed down from the parent grid so all cards
  // share one staggered sequence.
  variants?: Variants;
  // Eager-load the first couple of images (above the fold) — see
  // ImageWithPlaceholder's `priority` note.
  priority?: boolean;
}

export default function AiSuggestionCard({
  card,
  onSelect,
  variants,
  priority,
}: AiSuggestionCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      variants={variants}
      // Subtle lift on hover and a tactile 0.96 press — both interruptible.
      // Disabled entirely under prefers-reduced-motion.
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={() => onSelect(card.id)}
      className={cn(
        // Same card language as the rest of the app: rounded-xl, bordered,
        // soft shadow. Shadow (not transform) is the only CSS-transitioned
        // property — motion owns the lift/press transforms.
        "group flex flex-col text-left bg-card rounded-xl border border-border shadow-sm overflow-hidden",
        "transition-[box-shadow] duration-150 ease-out hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
      )}
    >
      <div className="relative">
        <ImageWithPlaceholder
          src={card.image}
          alt={card.title}
          aspectRatio="16/10"
          priority={priority}
          // Hairline image outline — pure black at 10% (never a tinted
          // neutral), inset so it doesn't change the image's size.
          className="outline outline-1 -outline-offset-1 outline-black/10"
        />
        {card.badge && (
          <Badge className="absolute top-2.5 left-2.5 shadow-sm">{card.badge}</Badge>
        )}
      </div>

      <div className="p-3.5">
        <div className="text-sm font-semibold leading-none">{card.title}</div>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed text-pretty line-clamp-2">
          {card.subtitle}
        </p>
        {card.meta && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="size-3 text-primary" aria-hidden="true" />
            {card.meta}
          </div>
        )}
      </div>
    </motion.button>
  );
}
