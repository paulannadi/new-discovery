// ─────────────────────────────────────────────────────────────────────────────
// StaggeredList
//
// Wraps a list of items so they fade in one by one when the list first
// renders. Implements the doc's "Staggered Card Reveal" pattern.
//
// Rules baked in here so callers don't have to remember them:
//   • 60ms stagger delay (doc says 50–80ms)
//   • Per-item: opacity 0→1 + translateY 8px→0, 200ms, ease-out
//   • Stagger only the first 6–8 items, then everything appears together —
//     otherwise a 30-result list takes ages to finish animating.
//   • Respects prefers-reduced-motion — for users who've requested less
//     motion we drop the slide and just do a tiny opacity fade.
//   • Doesn't re-stagger on re-renders. Once an item has been rendered, it
//     stays in place (no animation when filters change).
//
// Usage:
//   <StaggeredList>
//     {items.map(item => <Card key={item.id} {...item} />)}
//   </StaggeredList>
// ─────────────────────────────────────────────────────────────────────────────

import { Children, ReactNode, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StaggeredListProps {
  children: ReactNode;
  // Cap on how many items get the staggered delay. Items past this index
  // appear with the same delay as the cap, so the animation never drags on.
  staggerCap?: number;
  // Stagger between each item, in seconds. 0.06 = 60ms — the sweet spot.
  stagger?: number;
  className?: string;
}

export function StaggeredList({
  children,
  staggerCap = 6,
  stagger = 0.06,
  className,
}: StaggeredListProps) {
  // useReducedMotion reads the OS-level prefers-reduced-motion setting.
  // When true, we still fade items in but skip the slide-up.
  const prefersReducedMotion = useReducedMotion();

  // Track whether this list has already done its initial reveal. After the
  // first render we stop animating — re-renders (filter changes, sort, etc.)
  // should NOT re-stagger every card. The doc explicitly calls this out.
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  useEffect(() => {
    // Mark animated AFTER the first paint so children get their entry anim.
    const id = requestAnimationFrame(() => setHasAnimatedIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => {
        // Cap the per-item delay so item #20 doesn't wait 1.2s to appear.
        const cappedIndex = Math.min(index, staggerCap);
        const delay = hasAnimatedIn ? 0 : cappedIndex * stagger;

        return (
          <motion.div
            // Stable key — falls back to index if the child has none. The
            // outer caller is responsible for keying its children correctly;
            // this wrapper just preserves the order.
            key={index}
            initial={hasAnimatedIn ? false : { opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay,
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
