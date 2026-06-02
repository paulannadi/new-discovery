// ConversationScreen — the AI Itinerary "conversation + Smart Planner" view.
//
// The right-hand canvas IS Smart Planner: it renders the same `ItineraryHero`-
// style header card and the same `ItineraryTimeline` (with the real
// FlightCard / AccommodationCard / ActivityCard / TransferCard product cards)
// the rest of the app uses. AI chat suggestions on the left don't draw their
// own day cards anymore — they mutate the timeline items directly, and the
// most recently changed items are highlighted on the timeline so the user
// can spot the AI's contribution.
//
// Layout:
//   ┌────────────────────────────────────────────────────────────────┐
//   │ AiTopBar — branding · AI pill · trip chip · New trip · Share   │
//   ├────────────────────┬───────────────────────────────────────────┤
//   │ Conversation       │ Smart Planner canvas                      │
//   │ (40%)              │ (60%)                                     │
//   │ • Header           │ • Compact hero (image + dates + total)    │
//   │ • Chat transcript  │ • Optional hotel alternatives drawer      │
//   │ • Suggestion chips │ • ItineraryTimeline with highlighted ids  │
//   │ • Composer         │   for AI-just-added items                 │
//   └────────────────────┴───────────────────────────────────────────┘
//
// Mobile stacks the two panels behind a Chat / Itinerary tab switcher.

import { useEffect, useRef, useState } from "react";
import {
  Dot,
  Map as MapIcon,
  MessageCircle,
  Mic,
  PanelLeftClose,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../shared/components/ui/dialog";
import { Button } from "../../../../shared/components/ui/button";
import { showToast } from "../../../../shared/utils/toast";

import { ItineraryTimeline } from "../ItineraryTimeline";
import { ItineraryHero } from "../ItineraryHero";
import { StickySummaryBar } from "../StickySummaryBar";

import AiTopBar from "./AiTopBar";
import AiChatBubble from "./AiChatBubble";
import AiSuggestionChips from "./AiSuggestionChips";
import AiCanvasHeader from "./AiCanvasHeader";
import AiCanvasHotelAlternatives from "./AiCanvasHotelAlternatives";
import AiCanvasCheckoutModal, {
  type CheckoutStage,
} from "./AiCanvasCheckoutModal";
import { useAiPlanState, computeSpent } from "./useAiPlanState";

interface ConversationScreenProps {
  seedPrompt: string;
  // Called when the user "really" wants to leave — confirmed start-over or
  // post-checkout "Plan another trip". Returns them to Discovery.
  onNewTrip: () => void;
}

// Mobile-only tab switcher state.
type MobileTab = "chat" | "canvas";

export default function ConversationScreen({
  seedPrompt,
  onNewTrip,
}: ConversationScreenProps) {
  const {
    state,
    runAction,
    pickHotelAlt,
    closeHotelDrawer,
    sendReply,
    resetPlan,
  } = useAiPlanState(seedPrompt);

  // Mobile tab — defaults to "chat" so the user sees what they're talking
  // about, then can swipe over once the canvas starts filling.
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");

  // Desktop-only: lets the user minimize the chat so the Smart Planner
  // canvas takes the full page like the canonical SmartPlannerPage.
  // Mobile keeps the tab switcher above.
  const [chatMinimized, setChatMinimized] = useState(false);

  // Composer text — local state so we don't push every keystroke through
  // the plan reducer.
  const [composer, setComposer] = useState("");

  // Checkout modal stage.
  const [checkout, setCheckout] = useState<CheckoutStage>("closed");

  // "Start over?" confirmation when the user hits New trip mid-edit.
  const [confirmNew, setConfirmNew] = useState(false);

  // Auto-scroll chat to the latest message.
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [state.messages.length]);

  // Sticky-summary visibility — mirrors SmartPlannerPage:
  // hide the bar while the hero's dates+price capsule is still on screen
  // (the user can already see that info up top), then slide it up once the
  // user has scrolled past the hero. An invisible sentinel placed below the
  // hero is watched by an IntersectionObserver. Because the canvas has its
  // own scroll container (not the viewport), we point the observer's `root`
  // at that container.
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    const root = canvasScrollRef.current;
    if (!sentinel || !root) return;

    // Sentinel sits just below the hero. We only want to show the bar when
    // it has scrolled ABOVE the top of the scroll container (i.e. the user
    // has actually moved past the hero) — not when it's below (initial
    // state on tall screens).
    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPastHero =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowStickyBar(scrolledPastHero);
      },
      { root, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // Re-runs when the layout swaps (chatMinimized) because the scroll
    // container and sentinel are inside the conditional branch and remount.
  }, [chatMinimized]);

  const spent = computeSpent(state);

  // Mobile-tab dot — show on canvas tab when there's a fresh canvas change.
  const showCanvasDot = state.justAddedIds.size > 0 && mobileTab !== "canvas";

  // ─── Action handlers ─────────────────────────────────────────────────
  const handleSend = () => {
    const v = composer.trim();
    if (!v) return;
    sendReply(v);
    setComposer("");
  };

  const handlePickHotelAlt = (idx: number) => {
    pickHotelAlt(idx);
    showToast.success("Hotel updated");
  };

  const handleNewTripClick = () => setConfirmNew(true);
  const confirmStartOver = () => {
    setConfirmNew(false);
    resetPlan();
    onNewTrip();
  };

  // Post-checkout — already confirmed, so reset without re-prompting.
  const handlePostCheckoutNewTrip = () => {
    setCheckout("closed");
    resetPlan();
    onNewTrip();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-grey-lightest">
      {/* AiTopBar stays visible in both modes so "Back to discovery" is
          always one click away — including when the chat is minimized and
          the canvas takes the full page. */}
      <AiTopBar onBack={handleNewTripClick} />

      {/* Mobile tab switcher — hidden on md+ */}
      <div
        role="tablist"
        aria-label="View"
        className="md:hidden shrink-0 flex items-center gap-1 p-1 mx-4 mt-3 rounded-full border border-border bg-card shadow-sm self-center"
      >
        <MobileTabButton
          active={mobileTab === "chat"}
          onClick={() => setMobileTab("chat")}
          icon={<MessageCircle className="size-3.5" aria-hidden="true" />}
          label="Chat"
        />
        <MobileTabButton
          active={mobileTab === "canvas"}
          onClick={() => setMobileTab("canvas")}
          icon={<MapIcon className="size-3.5" aria-hidden="true" />}
          label="Itinerary"
          dot={showCanvasDot}
        />
      </div>

      {/* Split — desktop is 40/60 (or 100% canvas when chat is minimized),
          mobile is one column showing the active tab */}
      <div
        className={[
          "flex-1 min-h-0 grid grid-cols-1",
          chatMinimized ? "md:grid-cols-1" : "md:grid-cols-[40%_60%]",
        ].join(" ")}
      >
        {/* ── Conversation panel ──────────────────────────────────── */}
        <section
          aria-label="Conversation"
          className={[
            "flex flex-col min-h-0 bg-card md:border-r md:border-border",
            mobileTab === "chat" ? "flex" : "hidden md:flex",
            chatMinimized ? "md:hidden" : "",
          ].join(" ")}
        >
          <div className="px-5 pt-4 pb-3.5 border-b border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-primary opacity-50 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-grey">
                    AI Trip Concierge
                  </div>
                </div>
                <div className="text-base font-extrabold tracking-tight">
                  Planning your {state.trip.title}
                </div>
                <div className="text-xs text-grey mt-1">
                  {state.trip.travelersLabel} · {state.trip.nights} night
                  {state.trip.nights !== 1 ? "s" : ""} · €
                  {state.trip.budget.toLocaleString("en")} budget
                </div>
              </div>
              {/* Minimize button — desktop only. Mobile uses the tab
                  switcher above instead. */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatMinimized(true)}
                aria-label="Minimize chat"
                title="Minimize chat"
                className="hidden md:inline-flex size-8 rounded-lg text-grey hover:text-foreground shrink-0"
              >
                <PanelLeftClose className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-5 pt-5 pb-2 min-h-0"
          >
            {state.messages.map((m) => (
              <AiChatBubble key={m.id} message={m} />
            ))}
          </div>

          <AiSuggestionChips
            actions={state.pendingActions}
            onPickAction={runAction}
            onCheckout={() => setCheckout("open")}
          />

          <div className="px-4 pt-2 pb-4 border-t border-border">
            <div className="flex items-center gap-2.5 bg-grey-lightest border border-border rounded-lg px-3 py-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-grey hover:text-foreground"
                onClick={() =>
                  showToast.info("Attach panel would open here.")
                }
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
                placeholder="Reply to the AI…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-grey"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-grey hover:text-foreground"
                onClick={() =>
                  showToast.info("Voice input would start here.")
                }
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
          </div>
        </section>

        {/* ── Smart Planner canvas ────────────────────────────────── */}
        <section
          aria-label="Itinerary canvas"
          className={[
            "flex flex-col min-h-0 bg-grey-lightest overflow-hidden",
            mobileTab === "canvas" ? "flex" : "hidden md:flex",
          ].join(" ")}
        >
          {chatMinimized ? (
            // ─── CANONICAL SMART PLANNER LAYOUT ─────────────────────
            // Same building blocks as SmartPlannerPage so the page reads
            // as "the regular Smart Planner" once the AI chat is out of
            // the way: full ItineraryHero, max-w-5xl timeline column,
            // Back/Book footer, and StickySummaryBar pinned to the
            // viewport bottom. The data still comes from the AI plan
            // state so any items the AI added/changed remain visible
            // and highlighted via `state.justAddedIds`.
            <div ref={canvasScrollRef} className="overflow-y-auto h-full relative">
              <ItineraryHero
                title={state.trip.title}
                travelersLabel={state.trip.travelersLabel}
                nights={state.trip.nights}
                startDate={state.trip.startDate}
                endDate={state.trip.endDate}
                heroImageUrl={state.trip.heroImage}
                totalPriceLabel={`€${spent.toLocaleString("en")}`}
                onOpenMap={() => {}}
                onShareItinerary={() => {}}
                onToggleExpertMode={() => {}}
              />
              {/* Invisible sentinel — see useEffect above. Drives the
                  sticky bar's slide-up once it scrolls off the top. */}
              <div ref={heroSentinelRef} aria-hidden="true" className="h-0 w-0" />
              <div className="max-w-5xl mx-auto pl-1 pr-4 md:px-4 pt-5 md:pt-8 pb-32 box-content">
                <ItineraryTimeline
                  items={state.items}
                  passengerCount={2}
                  highlightedIds={state.justAddedIds}
                />
                {/* Footer — Book CTA only. AiTopBar's "Back to discovery"
                    link at the top of the page handles back-nav. */}
                <div className="flex justify-end items-center mt-8 pt-6 border-t border-border">
                  <Button size="lg" onClick={() => setCheckout("open")}>
                    Book · €{spent.toLocaleString("en")}
                  </Button>
                </div>
              </div>
              <StickySummaryBar
                startDate={state.trip.startDate}
                endDate={state.trip.endDate}
                adults={2}
                nights={state.trip.nights}
                totalPriceLabel={`€${spent.toLocaleString("en")}`}
                items={state.items}
                show={showStickyBar}
              />
            </div>
          ) : (
            // ─── COMPACT AI CANVAS LAYOUT ───────────────────────────
            // Used when the chat panel is open and the canvas is sharing
            // the screen at ~60% width. The hero is shrunk and the hotel
            // alternatives drawer is allowed so chat suggestions have an
            // in-canvas surface to drop into. The StickySummaryBar below
            // is constrained to the canvas column so it doesn't overlap
            // the chat panel on the left.
            <>
              <div
                ref={canvasScrollRef}
                className="overflow-y-auto h-full px-4 md:px-6 py-5 pb-32"
              >
                <AiCanvasHeader
                  title={state.trip.title}
                  travelersLabel={state.trip.travelersLabel}
                  nights={state.trip.nights}
                  startDate={state.trip.startDate}
                  endDate={state.trip.endDate}
                  heroImage={state.trip.heroImage}
                  spent={spent}
                  budget={state.trip.budget}
                  onCheckout={() => setCheckout("open")}
                />
                {/* Invisible sentinel — drives the sticky bar's slide-up
                    once it scrolls off the top of this scroll container. */}
                <div ref={heroSentinelRef} aria-hidden="true" className="h-0 w-0" />

                {state.hotelDrawer && (
                  <div className="mb-6">
                    <AiCanvasHotelAlternatives
                      onPick={handlePickHotelAlt}
                      onClose={closeHotelDrawer}
                    />
                  </div>
                )}

                <ItineraryTimeline
                  items={state.items}
                  passengerCount={2}
                  highlightedIds={state.justAddedIds}
                  hideAddStops
                />
              </div>
              <StickySummaryBar
                startDate={state.trip.startDate}
                endDate={state.trip.endDate}
                adults={2}
                nights={state.trip.nights}
                totalPriceLabel={`€${spent.toLocaleString("en")}`}
                items={state.items}
                show={showStickyBar}
                // Mobile (single-column tab view): full width. Desktop split:
                // start at 40% (where the chat panel ends) and span 60% so the
                // bar sits only under the canvas, not the chat composer.
                positionClassName="fixed bottom-0 left-0 w-full md:left-[40%] md:w-[60%]"
              />
            </>
          )}
        </section>
      </div>

      {/* Floating "Open AI chat" button — only shows when the chat panel
          is minimized on desktop. Sits above the StickySummaryBar with
          `bottom-24` so it isn't hidden behind it, and pulses a small dot
          when new AI suggestions are waiting so they don't get missed. */}
      {chatMinimized && (
        <Button
          onClick={() => setChatMinimized(false)}
          aria-label="Open AI chat"
          className="hidden md:inline-flex fixed bottom-24 left-6 z-40 h-11 rounded-full shadow-lg gap-2 pl-3.5 pr-4"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Open AI chat
          {state.pendingActions.length > 0 && (
            <span className="relative flex size-2 ml-0.5">
              <span className="absolute inline-flex size-full rounded-full bg-primary-foreground opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
            </span>
          )}
        </Button>
      )}

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
            <Button variant="ghost" onClick={() => setConfirmNew(false)}>
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

// ─── Mobile tab pill button ───────────────────────────────────────────
function MobileTabButton({
  active,
  onClick,
  icon,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-grey hover:text-foreground",
      ].join(" ")}
    >
      {icon}
      {label}
      {dot && (
        <Dot
          className="absolute -top-0.5 -right-0.5 size-5 text-primary"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
