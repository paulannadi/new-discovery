// ConversationScreen — the AI Itinerary "conversation-first" view.
//
// THE SHAPE OF THIS SCREEN (redesigned June 2026 — see
// AI-DISCOVERY-CONTINUOUS-FLOW-PLAN.md):
//
// The conversation is the ONLY surface until the trip is "ready". The user
// talks (or taps inspiration cards) and sees only the chat + the cards the AI
// generates inline. No Smart Planner itinerary is mounted yet.
//
// When the trip becomes "ready" (see `isItineraryReady` in useAiPlanState) we
// announce it ONCE — "Your itinerary is ready!" — and surface ONE control whose
// behaviour depends on the device:
//   • Mobile → PEEK. The itinerary slides up over the conversation; the chat
//     collapses to a bottom pill that taps back open.
//   • Desktop → SWITCH. The same control switches the whole view to the full
//     itinerary; the chat tucks into a side pill that re-opens it.
//
// After "ready", talking to the conversation updates the itinerary QUIETLY —
// no re-announcement, no destructive regeneration.
//
// Layout (single column, max-width centred):
//   ┌────────────────────────────────────────────────┐
//   │ AiTopBar — "Back to discovery"                  │
//   ├────────────────────────────────────────────────┤
//   │ Conversation                                    │
//   │ • header (AI Trip Concierge)                    │
//   │ • brief chips (📍 dest · 📅 dates · 👥 pax)     │
//   │ • chat transcript + inline inspiration cards    │
//   │ • [when ready] refine chips + "Open itinerary"  │
//   │ • composer                                      │
//   └────────────────────────────────────────────────┘
//   …and, once opened, the Smart Planner itinerary slides in OVER this.

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Mic, PartyPopper, Paperclip, Send, Sparkles, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../shared/components/ui/dialog";
import { Button } from "../../../../shared/components/ui/button";
import { cn } from "../../../../shared/components/ui/utils";
import { useIsMobile } from "../../../../shared/components/ui/use-mobile";
import { showToast } from "../../../../shared/utils/toast";

import { ItineraryTimeline } from "../ItineraryTimeline";
import { ItineraryHero } from "../ItineraryHero";
import { StickySummaryBar } from "../StickySummaryBar";
import { ItineraryBuildLoader } from "../ItineraryBuildLoader";

import AiTopBar from "./AiTopBar";
import AiChatBubble from "./AiChatBubble";
import AiSuggestionChips from "./AiSuggestionChips";
import AiCanvasHotelAlternatives from "./AiCanvasHotelAlternatives";
import AiGenerativeCanvas from "./AiGenerativeCanvas";
import AiCanvasStageSwitcher from "./AiCanvasStageSwitcher";
import AiCanvasCheckoutModal, {
  type CheckoutStage,
} from "./AiCanvasCheckoutModal";
import {
  useAiPlanState,
  computeSpent,
  DATE_OPTIONS,
  type PlanState,
} from "./useAiPlanState";

interface ConversationScreenProps {
  seedPrompt: string;
  // Called when the user "really" wants to leave — confirmed start-over or
  // post-checkout "Plan another trip". Returns them to Discovery.
  onNewTrip: () => void;
  // Persona seam (Phase 7). Defaults to the B2C guided experience. The "agent"
  // variant is STUBBED ONLY for now — see the note where cards are rendered.
  mode?: "consumer" | "agent";
}

export default function ConversationScreen({
  seedPrompt,
  onNewTrip,
  mode = "consumer",
}: ConversationScreenProps) {
  const {
    state,
    isItineraryReady,
    runAction,
    pickSuggestion,
    chooseDates,
    setCanvasStage,
    markReadyAnnounced,
    pickHotelAlt,
    closeHotelDrawer,
    sendReply,
    resetPlan,
  } = useAiPlanState(seedPrompt);

  // Breakpoint hook — drives the "one control, two behaviours" branch.
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  // ?debug=1 brings back the demo stage switcher (Countries · Cities · …).
  // It's a prototype-only affordance, hidden from the normal flow.
  const debug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debug");

  // Whether the Smart Planner itinerary surface is currently shown (peeked on
  // mobile / switched-to on desktop). This is SEPARATE from readiness: the trip
  // can be "ready" while the user is still in the conversation — they open it
  // with the control. The pill toggles this back to false.
  const [itineraryOpen, setItineraryOpen] = useState(false);

  // Desktop only — when the conversation is re-opened from INSIDE the itinerary,
  // it docks as a right-hand chat panel (a "chat bot") with the itinerary still
  // visible to its left, instead of switching back to the full conversation.
  // On mobile the conversation always returns full-screen, so this stays false.
  const [sideChatOpen, setSideChatOpen] = useState(false);

  // True once the entry intro (card rise + composer drop) has played. Lets the
  // conversation skip that animation when it later re-mounts (e.g. as the
  // desktop side panel), so the composer doesn't "fly in" every time.
  const [introDone, setIntroDone] = useState(false);

  // Phase 6 — mock "pricing latency". The first time the itinerary opens we
  // show the build loader while the (mock) draft is "priced", then reveal the
  // totals. "idle" → "loading" → "ready".
  const [pricing, setPricing] = useState<"idle" | "loading" | "ready">("idle");

  // Whether the itinerary's sticky summary bar is currently on screen. The chat
  // launcher lifts above it when it is, so the two don't collide. Reported up
  // from PlannerSurface (which owns the scroll observer).
  const [stickyVisible, setStickyVisible] = useState(false);

  // Phase 3 — the one-time celebratory banner. Distinct from `readyAnnounced`
  // in state (the permanent latch): this just controls the pop animation.
  const [showReadyBanner, setShowReadyBanner] = useState(false);

  // Phase 6 — a brief "Building your trip…" shimmer in the conversation right
  // after the dates step, before the ready announcement (open question #1:
  // keep the build hint rather than a pure surprise reveal).
  const [building, setBuilding] = useState(false);

  // Composer text — local so we don't push every keystroke through the reducer.
  const [composer, setComposer] = useState("");

  // Checkout modal stage.
  const [checkout, setCheckout] = useState<CheckoutStage>("closed");

  // "Start over?" confirmation when the user hits Back mid-plan.
  const [confirmNew, setConfirmNew] = useState(false);

  const spent = computeSpent(state);

  // Device-aware label for the single control (Phase 4).
  const openLabel = isMobile ? "See itinerary" : "Open itinerary";

  // Mark the entry intro as finished shortly after first mount, so later
  // re-mounts of the conversation skip the fly-in.
  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  // Auto-scroll the chat to the latest message / inline cards.
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [state.messages.length, state.awaitingDates, state.hotelDrawer, building]);

  // Phase 3 — fire the "ready" announcement exactly once. We wait for the
  // build shimmer to finish, then (if not already announced) pop the banner
  // and flip the permanent latch so it never re-nags on later edits.
  useEffect(() => {
    if (isItineraryReady && !building && !state.readyAnnounced) {
      setShowReadyBanner(true);
      markReadyAnnounced();
    }
  }, [isItineraryReady, building, state.readyAnnounced, markReadyAnnounced]);

  // ─── Action handlers ─────────────────────────────────────────────────
  const handleSend = () => {
    const v = composer.trim();
    if (!v) return;
    sendReply(v);
    setComposer("");
  };

  // Answering the dates question is the moment the trip becomes ready. We
  // run a short build shimmer first so the reveal feels earned, not abrupt.
  const handleChooseDates = (optionId: string) => {
    chooseDates(optionId);
    setBuilding(true);
    window.setTimeout(() => setBuilding(false), 1500);
  };

  // The single control. Opens the itinerary surface (peek/switch), dismisses
  // the celebratory banner, and triggers the one-time pricing loader.
  const openItinerary = () => {
    setShowReadyBanner(false);
    setSideChatOpen(false);
    setItineraryOpen(true);
    if (pricing === "idle") {
      setPricing("loading");
      window.setTimeout(() => setPricing("ready"), 1800);
    }
  };

  // Re-open the conversation from the itinerary's AI button. Desktop docks it
  // as a right-side chat panel (itinerary stays visible); mobile returns to the
  // full-screen conversation.
  const reopenConversation = () => {
    if (isMobile) {
      setItineraryOpen(false);
      setSideChatOpen(false);
    } else {
      setSideChatOpen(true);
    }
  };

  const handlePickHotelAlt = (idx: number) => {
    pickHotelAlt(idx);
    showToast.success("Hotel updated");
  };

  const handleNewTripClick = () => setConfirmNew(true);
  const confirmStartOver = () => {
    setConfirmNew(false);
    // Reset everything back to a fresh conversation, including local view state.
    resetPlan();
    setItineraryOpen(false);
    setSideChatOpen(false);
    setPricing("idle");
    setShowReadyBanner(false);
    onNewTrip();
  };

  // Post-checkout — already confirmed, so reset without re-prompting.
  const handlePostCheckoutNewTrip = () => {
    setCheckout("closed");
    resetPlan();
    setItineraryOpen(false);
    setSideChatOpen(false);
    setPricing("idle");
    setShowReadyBanner(false);
    onNewTrip();
  };

  // Which inline content shows in the conversation right now (before opening
  // the itinerary): the dates quick-replies, the hotel-swap drawer, or the
  // generated inspiration cards.
  const showInlineCards =
    mode === "consumer" && // Phase 7: agent variant would skip inspiration cards
    !isItineraryReady &&
    !state.awaitingDates &&
    state.canvasStage !== "itinerary";

  // Conversation layout: it renders either as the primary surface (itinerary
  // not open) or, on desktop, as the right-side chat panel docked over the
  // itinerary.
  const chatIsSide = sideChatOpen && itineraryOpen && !isMobile;
  const showConversation = !itineraryOpen || chatIsSide;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-grey-lightest">
      {/* "Back to discovery" stays reachable at all times. */}
      <AiTopBar onBack={handleNewTripClick} />

      {/* The stage. The conversation always lives here; the itinerary surface
          slides in OVER it when opened, so the conversation keeps its scroll
          and state underneath ("one room"). */}
      <div className="relative flex-1 min-h-0">
        {/* Muted melted-gradient backdrop — the SAME animated gradient as the
            Discovery "AI Experience" entry, carried through but heavily muted.
            It shows in the margins around the floating conversation card, so
            this screen reads as a continuation of where the user just was. */}
        <ConversationBackdrop reduceMotion={Boolean(reduceMotion)} />

        {/* ── CONVERSATION ─────────────────────────────────────────────── */}
        {/* Three layouts:
              • Full + desktop → a FLOATING rounded card (max-w-[860px]) over the
                gradient.
              • Full + mobile → FULL-SCREEN chat, edge-to-edge.
              • Side (desktop only) → a floating chat-widget box that sits ON TOP
                of the itinerary in the bottom-right corner (the itinerary stays
                full-width underneath), like any regular chatbox. */}
        <AnimatePresence>
          {showConversation && (
            <section
              key="conversation"
              aria-label="Conversation"
              className={cn(
                "absolute min-h-0 flex",
                chatIsSide
                  ? "z-50 bottom-4 right-4 w-[400px] max-w-[calc(100%-2rem)] h-[min(640px,calc(100%-2rem))]"
                  : "inset-0 items-stretch justify-center p-0 md:p-8",
              )}
            >
          <motion.div
            // Full mode: fades + rises in once (skipped on re-mount via
            // `introDone`). Side mode: pops up from the launcher (bottom-right).
            initial={
              reduceMotion
                ? false
                : chatIsSide
                  ? { opacity: 0, y: 16, scale: 0.96 }
                  : introDone
                    ? false
                    : { opacity: 0, y: 14 }
            }
            animate={chatIsSide ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : chatIsSide
                  ? { opacity: 0, y: 16, scale: 0.96 }
                  : { opacity: 0 }
            }
            transition={{ duration: chatIsSide ? 0.22 : 0.4, ease: [0.2, 0, 0, 1] }}
            style={chatIsSide ? { transformOrigin: "bottom right" } : undefined}
            className={cn(
              "relative flex-1 min-h-0 flex flex-col bg-card",
              chatIsSide
                ? "w-full rounded-xl shadow-2xl border border-border/60 overflow-hidden"
                : "w-full max-w-none md:max-w-[860px] md:bg-card/95 md:backdrop-blur-sm rounded-none md:rounded-3xl shadow-none md:shadow-2xl border-0 md:border md:border-border/60",
            )}
          >
            {/* Header — also hosts the ONE control (Open/Peek itinerary) on the
                right once the trip is ready. The one-time "ready" banner drops
                just beneath it. */}
            {/* Stacks on mobile (title, then the control row beneath it) so the
                title keeps full width; side-by-side from md up. */}
            <div className="relative px-5 pt-5 pb-3.5 border-b border-border flex flex-col gap-2.5 md:flex-row md:items-start md:justify-between md:gap-3">
              <div className="min-w-0">
                <div className="text-lg font-bold tracking-tight text-balance">
                  {isItineraryReady ? "Planning your trip" : "Let's find your trip"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isItineraryReady
                    ? "Keep talking to refine — your itinerary updates as you go."
                    : "Tell me more, or tap an option below."}
                </div>
              </div>

              {chatIsSide ? (
                // Side-panel mode: the itinerary is already open beside us, so
                // the control becomes a "close the chat panel" button.
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Close chat"
                  onClick={() => setSideChatOpen(false)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                isItineraryReady &&
                !building && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* One-time celebratory banner — sits to the LEFT of the
                        control, so the announcement points right at it. */}
                    <AnimatePresence>
                      {showReadyBanner && (
                        <ReadyBanner
                          reduceMotion={Boolean(reduceMotion)}
                          onDismiss={() => setShowReadyBanner(false)}
                        />
                      )}
                    </AnimatePresence>
                    <Button
                      size="sm"
                      onClick={openItinerary}
                      data-feature-id="smartplanner_ai_open-itinerary"
                    >
                      {openLabel}
                    </Button>
                  </div>
                )
              )}
            </div>

            {/* No trip-context chip strip — the context lives only in the
                conversation, so nothing is pulled out or accumulated above it. */}

            {/* Debug-only stage switcher (gated behind ?debug=1). */}
            {debug && (
              <AiCanvasStageSwitcher
                stage={state.canvasStage}
                onChange={setCanvasStage}
              />
            )}

            {/* Transcript + inline cards. Fades in just after the composer
                starts its drop, so the input descends over a clear area. */}
            <motion.div
              ref={threadRef}
              initial={
                reduceMotion || introDone || chatIsSide ? false : { opacity: 0 }
              }
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              // Tall bottom padding clears the floating composer; the fade mask
              // makes messages dissolve below it as they scroll (no divider).
              className="chat-thread-fade flex-1 overflow-y-auto px-5 pt-5 pb-32 min-h-0"
            >
              {state.messages.map((m) => (
                <AiChatBubble key={m.id} message={m} />
              ))}

              {/* Inline inspiration cards (countries / cities / templates).
                  Reuses AiGenerativeCanvas as-is — picking a card advances
                  the conversation. */}
              {showInlineCards && (
                <div className="-mx-1 mt-1">
                  <AiGenerativeCanvas
                    stage={state.canvasStage}
                    onSelect={pickSuggestion}
                  />
                </div>
              )}

              {/* Dates + travellers quick-replies — the step that flips
                  readiness on. */}
              {state.awaitingDates && (
                <DateQuickReplies onPick={handleChooseDates} />
              )}

              {/* The hotel-swap drawer, surfaced inline when the user asks for
                  cheaper hotels from chat (a scoped, post-ready edit). */}
              {state.hotelDrawer && (
                <div className="mt-2 mb-4">
                  <AiCanvasHotelAlternatives
                    onPick={handlePickHotelAlt}
                    onClose={closeHotelDrawer}
                  />
                </div>
              )}

              {/* Phase 6 — "Building your trip…" shimmer. */}
              {building && <BuildingShimmer />}
            </motion.div>

            {/* Floating bottom cluster — the refine chips + composer float over
                the conversation (no divider). `pointer-events-none` lets scroll
                and clicks pass through the gaps to the transcript behind; the
                interactive children re-enable pointer events. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 px-3 pb-3">
              {/* Phase 5 — refine chips, available once the trip is ready so
                  talking keeps shaping the (already-revealed) itinerary. */}
              {isItineraryReady && !building && (
                <div className="pointer-events-auto [&>div]:px-1">
                  <AiSuggestionChips
                    actions={state.pendingActions}
                    onPickAction={runAction}
                    onCheckout={() => setCheckout("open")}
                  />
                </div>
              )}

              {/* Composer — floats as a detached bar. On first mount it "flies
                  in" from mid-screen, echoing the entry prompt bar dropping in. */}
              <motion.div
                initial={
                  reduceMotion || introDone || chatIsSide
                    ? false
                    : { y: "-32vh", opacity: 0, scale: 1.02 }
                }
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 17, delay: 0.05 }}
                className="pointer-events-auto"
              >
                <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg shadow-lg px-3 py-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => showToast.info("Attach panel would open here.")}
                  aria-label="Attach"
                >
                  <Paperclip className="size-4" aria-hidden="true" />
                </Button>
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder={
                    isItineraryReady
                      ? "Keep talking — refine anything…"
                      : "Reply to the AI…"
                  }
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => showToast.info("Voice input would start here.")}
                  aria-label="Voice (coming soon)"
                >
                  <Mic className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  className="h-8 rounded-lg"
                  aria-label="Send"
                >
                  <Send className="size-3.5" aria-hidden="true" />
                </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
            </section>
          )}
        </AnimatePresence>

        {/* ── ITINERARY SURFACE (Phase 4) ──────────────────────────────── */}
        {/* Slides in over the conversation. Mobile peeks up (translateY),
            desktop switches in from the right (translateX). When the desktop
            side chat is open it makes room on the right for the chat panel. */}
        <AnimatePresence>
          {itineraryOpen && (
            <PlannerSurface
              state={state}
              spent={spent}
              priced={pricing === "ready"}
              isMobile={isMobile}
              reduceMotion={Boolean(reduceMotion)}
              onCheckout={() => setCheckout("open")}
              onStickyChange={setStickyVisible}
            />
          )}
        </AnimatePresence>

        {/* Floating chat launcher — the single way back into the conversation
            from the itinerary, on every screen size. Opens the chatbox overlay
            on desktop / the full-screen chat on mobile; hidden while open. */}
        {itineraryOpen && !chatIsSide && (
          <Button
            size="icon"
            onClick={reopenConversation}
            aria-label="Open Planner Copilot chat"
            // Lifts above the sticky summary bar once it scrolls into view
            // (transition-all on the Button animates the move).
            className={cn(
              "flex absolute right-6 z-50 size-14 rounded-full shadow-lg hover:scale-105",
              stickyVisible ? "bottom-24" : "bottom-6",
            )}
          >
            <Sparkles className="size-6" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <AiCanvasCheckoutModal
        state={state}
        spent={spent}
        stage={checkout}
        onCancel={() => setCheckout("closed")}
        onConfirm={() => setCheckout("confirmed")}
        onNewTrip={handlePostCheckoutNewTrip}
      />

      {/* Start-over confirmation */}
      <Dialog open={confirmNew} onOpenChange={setConfirmNew}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Start a new trip?</DialogTitle>
            <DialogDescription>
              You'll go back to the moodboard. Your current draft itinerary
              won't be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="tertiary" onClick={() => setConfirmNew(false)}>
              Keep planning
            </Button>
            <Button variant="secondary" onClick={confirmStartOver}>
              Yes, start over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Muted gradient backdrop ───────────────────────────────────────────────
// The "melted gradient" from the Discovery AI Experience entry, carried
// through but heavily muted: a low-opacity tokenised gradient under a neutral
// wash, so it's a soft hint behind the conversation rather than a vivid hero.
// The gradient colours live in CSS tokens (.ai-backdrop-gradient) so no hex is
// hardcoded here.
function ConversationBackdrop({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-grey-lightest"
      aria-hidden="true"
    >
      <motion.div
        className="ai-backdrop-gradient absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 0.6 }}
      />
      {/* Neutral wash on top — this is what "mutes it a lot". */}
      <div className="absolute inset-0 bg-grey-lightest/45" />
    </div>
  );
}

// ─── Date + travellers quick replies ───────────────────────────────────────
function DateQuickReplies({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 mt-1">
      {DATE_OPTIONS.map((opt) => (
        <Button
          key={opt.id}
          variant="tertiary"
          size="sm"
          className="rounded-full"
          onClick={() => onPick(opt.id)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ─── "Building your trip…" shimmer (Phase 6) ───────────────────────────────
function BuildingShimmer() {
  return (
    <div
      className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground py-2"
      role="status"
      aria-live="polite"
    >
      <span>Building your trip</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.2s]" />
        <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.1s]" />
        <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" />
      </span>
    </div>
  );
}

// ─── Ready announcement banner (Phase 3) ───────────────────────────────────
// Pops once when the trip becomes ready. Announced to screen readers; the
// actual action lives in the persistent button beneath it.
function ReadyBanner({
  reduceMotion,
  onDismiss,
}: {
  reduceMotion: boolean;
  onDismiss: () => void;
}) {
  // Slides in from the right (toward the button it sits beside).
  const variants: Variants = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : 8 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : 8 },
  };
  return (
    <motion.div
      role="status"
      aria-live="polite"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="flex items-center gap-1.5 rounded-xl bg-secondary py-2 pl-3 pr-2 text-sm font-semibold text-secondary-foreground shadow-md whitespace-nowrap"
    >
      <PartyPopper className="size-4 shrink-0" aria-hidden="true" />
      <span>Your itinerary is ready!</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-secondary-foreground/70 hover:bg-white/10 hover:text-secondary-foreground"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

// ─── Planner surface (Phase 4 + 6) ─────────────────────────────────────────
// The full Smart Planner itinerary, reusing the canonical building blocks
// (ItineraryHero, ItineraryTimeline, StickySummaryBar). Slides in over the
// conversation. While the mock pricing is "loading" we cover it with the
// build loader so no precise total flashes before it's ready.
function PlannerSurface({
  state,
  spent,
  priced,
  isMobile,
  reduceMotion,
  onCheckout,
  onStickyChange,
}: {
  state: PlanState;
  spent: number;
  priced: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
  onCheckout: () => void;
  // Reports the sticky summary bar's visibility up so the chat launcher can
  // lift above it.
  onStickyChange: (visible: boolean) => void;
}) {
  // Sticky-summary visibility — mirrors SmartPlannerPage: hide the bar while
  // the hero's dates+price capsule is on screen, then slide it up once the
  // user scrolls past the hero. The canvas has its own scroll container, so we
  // point the observer's `root` at it.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPastHero =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowStickyBar(scrolledPastHero);
        onStickyChange(scrolledPastHero);
      },
      { root, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      // Reset on unmount (itinerary closed) so the launcher returns to its
      // resting position next time.
      onStickyChange(false);
    };
  }, [onStickyChange]);

  // Enter/exit motion: mobile peeks up, desktop switches in from the right.
  // Reduced motion → a plain fade.
  const variants: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : isMobile
      ? {
          hidden: { y: "100%" },
          visible: { y: 0 },
          exit: { y: "100%" },
        }
      : {
          hidden: { x: "100%" },
          visible: { x: 0 },
          exit: { x: "100%" },
        };

  const priceLabel = `€${spent.toLocaleString("en")}`;

  return (
    <motion.section
      aria-label="Itinerary"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.45, ease: [0.6, 0.05, 0.2, 1] }}
      className="absolute inset-0 z-40 bg-grey-lightest flex flex-col min-h-0"
    >
      {/* Phase 6 — while the mock draft is "pricing", bridge with the loader. */}
      {!priced && <ItineraryBuildLoader />}

      <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0 relative">
        <ItineraryHero
          title={state.trip.title}
          travelersLabel={state.trip.travelersLabel}
          nights={state.trip.nights}
          startDate={state.trip.startDate}
          endDate={state.trip.endDate}
          heroImageUrl={state.trip.heroImage}
          totalPriceLabel={priceLabel}
          onOpenMap={() => {}}
          onShareItinerary={() => {}}
          onToggleExpertMode={() => {}}
        />
        {/* Sentinel — drives the sticky bar's slide-up once it scrolls off. */}
        <div ref={sentinelRef} aria-hidden="true" className="h-0 w-0" />
        <div className="max-w-5xl mx-auto pl-1 pr-4 md:px-4 pt-5 md:pt-8 pb-32 box-content">
          <ItineraryTimeline
            items={state.items}
            passengerCount={2}
            highlightedIds={state.justAddedIds}
          />
          <div className="flex justify-end items-center mt-8 pt-6 border-t border-border">
            <Button size="lg" onClick={onCheckout}>
              Book · {priceLabel}
            </Button>
          </div>
        </div>
        <StickySummaryBar
          startDate={state.trip.startDate}
          endDate={state.trip.endDate}
          adults={2}
          nights={state.trip.nights}
          totalPriceLabel={priceLabel}
          items={state.items}
          show={showStickyBar}
        />
      </div>
    </motion.section>
  );
}
