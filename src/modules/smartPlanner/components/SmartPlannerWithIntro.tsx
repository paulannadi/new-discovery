// ─────────────────────────────────────────────────────────────────────────────
// SmartPlannerWithIntro
//
// Wrapper around SmartPlannerPage that displays the ItineraryBuildLoader for
// a fixed duration (default 5s) before revealing the actual planner. This
// matches the real product behaviour: itinerary building takes >5s, so we
// always show the branded loader on entry.
//
// Smart Planner is mounted *underneath* the loader from the start. That way
// it has time to do its own initial work behind the cover, and when the
// loader fades out the page is fully ready. The fade itself uses Framer
// Motion's <AnimatePresence> so we get a clean exit animation.
//
// Props are identical to SmartPlannerPage's — this wrapper is a drop-in
// replacement at the App.tsx render site.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SmartPlannerPage, {
  type StartingContext,
} from "../pages/SmartPlannerPage";
import { ItineraryBuildLoader } from "./ItineraryBuildLoader";

// Fixed duration for the loader in milliseconds. 30 seconds is a realistic
// upper bound for itinerary building — long enough to feel like the real
// product, not so long that reviewers get stuck (the Skip button gives
// demos an out).
const LOADER_DURATION_MS = 30000;

type SmartPlannerWithIntroProps = {
  startingContext: StartingContext;
  onBack: () => void;
};

export default function SmartPlannerWithIntro({
  startingContext,
  onBack,
}: SmartPlannerWithIntroProps) {
  // showLoader controls whether the overlay is visible. We start true on
  // every fresh mount of this wrapper — and the wrapper remounts whenever
  // currentPage flips away from "smart-planner" and back, so each entry to
  // Smart Planner gets a fresh loader without us having to reset anything.
  const [showLoader, setShowLoader] = useState(true);

  // Reduced-motion users get the loader without any entry/exit animation —
  // it just disappears when the timer fires. Otherwise we crossfade.
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DURATION_MS);

    // Clear the timer if the user navigates away mid-load — prevents a
    // setState on an unmounted component.
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <>
      {/* The actual planner is mounted from the start and sits behind the
          loader. By the time the loader exits, the page is fully laid out. */}
      <SmartPlannerPage startingContext={startingContext} onBack={onBack} />

      <AnimatePresence>
        {showLoader && (
          <motion.div
            // Initial state is "visible" so we don't fade IN on mount —
            // we only fade OUT when the loader dismisses.
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              ease: "easeOut",
            }}
            // Pin the fade layer so it covers the planner during the exit.
            className="fixed inset-0 z-50"
          >
            <ItineraryBuildLoader onSkip={() => setShowLoader(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
