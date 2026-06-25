// AiGenerativeCanvas — the right-hand panel BEFORE the itinerary exists.
//
// Depending on the conversation, this shows AI-suggested cards in a 2-column
// grid: countries (from a vibe), cities (from a country), or ready-made
// templates. Picking a card advances the flow; once enough detail is gathered
// the canvas swaps to the real Smart Planner itinerary (handled by the parent).
//
// The grid uses container queries so it reflows to whatever width the canvas
// actually has — one column when the chat panel is open / on mobile, two
// columns once there's room (e.g. when the chat is minimized).
//
// Enter animation (per "make-interfaces-feel-better"): rather than fading the
// whole panel as one block, the heading and each card are split into semantic
// chunks and staggered. Keying the container on `stage` replays the sequence
// every time the canvas regenerates into a new stage.

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { cardsForStage, stageMeta, type CanvasStage } from "./useAiPlanState";
import AiSuggestionCard from "./AiSuggestionCard";

interface AiGenerativeCanvasProps {
  stage: CanvasStage;
  onSelect: (id: string) => void;
}

// Each chunk fades up from 12px with a 4px de-blur — the standard enter recipe.
const ENTER: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.2, 0, 0, 1] },
  },
};

// The outer container staggers the heading then the grid; the grid in turn
// staggers its own cards. ~70ms / ~55ms reads as a quick cascade, not a slideshow.
const CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const GRID: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

export default function AiGenerativeCanvas({
  stage,
  onSelect,
}: AiGenerativeCanvasProps) {
  const reduce = useReducedMotion();
  const meta = stageMeta(stage);
  const cards = cardsForStage(stage);

  return (
    <motion.div
      // Remount on stage change so the stagger replays each time the canvas
      // regenerates. Reduced motion skips the entrance entirely.
      key={stage}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={CONTAINER}
      className="@container px-4 md:px-6 py-5 pb-32"
    >
      {/* Stage heading — mirrors the "AI" framing used in the chat header. */}
      <motion.div variants={ENTER} className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full rounded-full bg-primary opacity-50 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-grey">
            Generated for you
          </span>
        </div>
        <h2 className="text-lg font-extrabold tracking-tight text-balance">
          {meta.heading}
        </h2>
        <p className="text-sm text-grey mt-1 text-pretty">{meta.subtext}</p>
      </motion.div>

      {/* 2-up grid; collapses to a single column when the panel is narrow. */}
      <motion.div
        variants={GRID}
        className="grid grid-cols-1 @[520px]:grid-cols-2 gap-3.5"
      >
        {cards.map((card, i) => (
          <AiSuggestionCard
            key={card.id}
            card={card}
            onSelect={onSelect}
            variants={ENTER}
            priority={i < 2}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
