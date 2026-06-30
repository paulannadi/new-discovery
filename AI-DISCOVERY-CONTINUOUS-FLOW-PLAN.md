# Handoff Plan — Continuous AI Flow in the New Discovery

**For:** Claude Code (engineering)
**From:** Paula (Design Engineer) — concept owner
**Status:** Ready to build · prototype-quality (mock data, no real pricing/NLP)
**Visual north star:** `ai-discovery-flow-prototype.html` at repo root (open in a browser, use the **Mobile / Desktop** toggle).

---

## 0. TL;DR — what we're building

Evolve the **existing** AI Itinerary flow from a *split-view-from-the-start* into a **conversation-first, single-surface** experience that lives inside Discovery's **AI Experience** mode.

The user talks (or taps suggestion cards) and sees only the conversation + generated inspiration cards. **No itinerary canvas appears until the trip is "ready."** At that moment we announce it **once** — *"Your itinerary is ready!"* — and surface **one control** whose behavior depends on the device:

- **Mobile → peek / minimize.** The conversation collapses to a pill; the Smart Planner itinerary slides up into the *same* surface. Tapping the pill re-opens the conversation.
- **Desktop → full-switch.** The same control switches the view to the full Smart Planner itinerary; the conversation tucks into a side pill that re-opens it.

After "ready," the conversation stays reachable, and talking to it updates the itinerary **quietly** (no re-announcement, no destructive regeneration).

This is **not a rewrite.** We are restructuring `ConversationScreen` and extending `useAiPlanState`. Most building blocks already exist.

---

## 1. Why this design (the decisions already locked)

These were decided with the design lead — **do not relitigate them, build them:**

1. **Conversation is the only surface until "ready."** Avoids a half-built itinerary with shaky prices, and protects Smart Planner's "one screen, not a chatbot" feel.
2. **One control, two behaviors** (mobile peek / desktop switch). Ship both as the *same* affordance, branch on breakpoint.
3. **The "ready" announcement fires exactly once.** After that the control is just permanently available; it must never re-nag on later edits.
4. **Conversational edits after ready are scoped edits, not regenerations.** "Make it cheaper" tweaks the existing trip; it does not wipe the user's manual changes. Only an explicit "start over" resets.
5. **Pricing waits for "ready."** Inspiration cards (countries/cities/templates) are price-free or show "from €X". Real per-trip totals appear only once we're in the itinerary (this is the Dynamic Packaging latency boundary).
6. **Persona: one adaptive surface.** Default to the B2C-style guided experience for the prototype. Leave a single config seam (`mode: "consumer" | "agent"`) so an agent variant can later skip the inspiration cards — **stub it, don't build the agent path now.**
7. **The demo "Preview" stage switcher is removed from this flow** (it was a prototype affordance). Keep the file; just gate it behind a `?debug=1` flag.

---

## 2. Where it lives — entry & integration points

The entry path already exists and **should not change**:

```
DiscoveryPage  (AI Experience toggle ON → melted-gradient hero)
   → AiMoodboardComposer  (vibes / places / free text → composed prompt)
   → "Plan my trip"  → App.tsx routes to AiItineraryPage(initialPrompt)
        → ConversationScreen(seedPrompt)        ← THIS is what we restructure
```

Relevant existing files:

| File | Role | Touch? |
|---|---|---|
| `src/modules/smartPlanner/pages/DiscoveryPage.tsx` | AI Experience toggle + moodboard entry | No (entry unchanged) |
| `src/modules/smartPlanner/components/aiItinerary/AiMoodboardComposer.tsx` | Composes the seed prompt | No |
| `src/modules/smartPlanner/pages/AiItineraryPage.tsx` | Thin host, passes `initialPrompt` | Minor |
| `src/modules/smartPlanner/components/aiItinerary/ConversationScreen.tsx` | **Split view today** | **Major restructure** |
| `src/modules/smartPlanner/components/aiItinerary/useAiPlanState.ts` | Plan state + `canvasStage` + cards | **Extend (readiness)** |
| `src/modules/smartPlanner/components/aiItinerary/AiGenerativeCanvas.tsx` | Inspiration cards (countries/cities/templates) | Reuse as-is |
| `src/modules/smartPlanner/components/aiItinerary/AiCanvasStageSwitcher.tsx` | Demo "Preview" switcher | Gate behind debug flag |
| `src/modules/smartPlanner/components/aiItinerary/AiChatBubble.tsx`, `AiSuggestionCard.tsx`, `AiSuggestionChips.tsx` | Conversation + card UI | Reuse |
| Smart Planner blocks: `ItineraryHero`, `DayByDaySection`, `ItineraryTimeline`, `StickySummaryBar`, `SmartPlannerWithIntro`, `ItineraryBuildLoader` | The "ready" itinerary view | Reuse |

Shared primitives to lean on (already in `src/shared/components/ui/`): `Sheet` and `Drawer` (mobile peek + re-open), `Button`, `Tooltip`, `use-mobile.ts` (`useIsMobile` breakpoint hook), Framer Motion with `useReducedMotion` (pattern already used in `AiGenerativeCanvas`).

---

## 3. State model changes — `useAiPlanState.ts`

Today the canvas resolves to the itinerary purely when `canvasStage === "itinerary"` (advanced by card selection). We add an explicit **readiness** concept so "ready" is a real, testable threshold rather than a side effect.

**Add to `PlanState` (or derive via selectors):**

- `meta` already exists as `TripMeta` — confirm it carries the brief slots: `destination`, `duration`/`nights`, `travellers`, `dates` (add any missing).
- `isItineraryReady: boolean` — **derived** from a `READY_SLOTS` rule. Minimum: `destination` AND (`duration` OR `dates`) AND `travellers`. Put the rule in one function `computeReadiness(meta): boolean` so it's tweakable in one place.
- `readyAnnounced: boolean` — a **once-only latch**. Set true the first time `isItineraryReady` flips true and we show the toast. Never reset except on "start over."

**Keep:** `canvasStage`, `selectCard`, `cardsForStage`, `stageMeta`, the card data. The generative stages still drive the inspiration cards; readiness simply gates the *itinerary reveal* and the announcement.

**Add:** `applyScopedEdit(actionId)` semantics note — the existing `ACTIONS`/`ActionId` machinery should mutate the existing plan (e.g. swap a hotel, add a dinner) **without** resetting `canvasStage` or `readyAnnounced`. Verify current actions don't bounce the stage back.

Acceptance: a small unit-free check — stepping through the seeded conversation flips `isItineraryReady` exactly once, and `readyAnnounced` stays true through subsequent edits.

---

## 4. Build phases

Each phase is a self-contained, reviewable chunk. Land them in order. Paula is non-technical — **comment generously and explain the "why" in the PR description**, per repo `CLAUDE.md`.

### Phase 1 — Readiness in state (no UI yet)
- Implement `computeReadiness`, `isItineraryReady`, `readyAnnounced` in `useAiPlanState.ts`.
- Confirm the seeded demo conversation reaches readiness after the dates/travellers step (mirrors the prototype: vibe → country → template/regions → dates+pax → ready).
- **Acceptance:** log/inspect state — readiness flips true at the right step; scoped edits don't unset it.

### Phase 2 — Conversation-first surface
- Restructure `ConversationScreen` so that **before** `isItineraryReady`, it renders the conversation full-width with `AiGenerativeCanvas` cards inline (or as the right rail collapsed on desktop) — **the Smart Planner canvas is not mounted/visible yet.**
- Remove `AiCanvasStageSwitcher` from the normal render path; gate behind `?debug=1`.
- Add the **running trip-brief chips** (destination / dates / vibe / travellers) at the top of the conversation, reading from `meta`. This is the visible shared state and doubles as the minimized-conversation summary later.
- Keep `seedPrompt` → first user message behavior intact.
- **Acceptance:** from Discovery, "Plan my trip" lands in a conversation-only view; no itinerary visible; brief chips populate as the user advances.

### Phase 3 — The "ready" moment (once)
- When `isItineraryReady` flips true and `readyAnnounced` is false: show a **"Your itinerary is ready!"** toast/tooltip anchored near the primary control, then set `readyAnnounced = true`.
- The toast carries the action button. Label depends on device: **"Peek itinerary"** (mobile) / **"Open itinerary"** (desktop).
- Use the existing toast util or an inline Framer-Motion element (see prototype). Respect `useReducedMotion`.
- **Acceptance:** toast appears exactly once, at the right moment; never reappears after edits.

### Phase 4 — One control, two behaviors
Branch on `useIsMobile()`:

- **Mobile (peek/minimize):** tapping the control mounts the Smart Planner itinerary in the same surface (full height) and collapses the conversation into a **bottom pill** ("Planner Copilot · tap to refine"). Use `Drawer`/`Sheet` for the re-open. The itinerary uses the existing Smart Planner blocks (`ItineraryHero`, `DayByDaySection`, `StickySummaryBar`).
- **Desktop (full-switch):** tapping the control switches the view to the full Smart Planner itinerary (reuse the `canvasStage === "itinerary"` rendering, but now full-width, not 40/60). The conversation tucks into a **side pill / floating button** that re-opens it (reuse the existing "Open AI chat" floating button pattern already in `ConversationScreen`).
- The pill/back returns to the conversation in both modes.
- **Acceptance:** with the device toggle / responsive resize, the same control peeks on mobile and switches on desktop; re-open works both ways; matches `ai-discovery-flow-prototype.html`.

### Phase 5 — Post-ready continuity
- Conversation remains reachable after ready (pill/side button).
- Conversational edits (`ACTIONS`) update the itinerary **in place**; show a tiny "updated" affordance, **no toast, no re-announce**.
- Verify the itinerary reflects edits when re-opened.
- **Acceptance:** "make it cheaper" / "add a dinner" changes the open itinerary without resetting it or re-firing the ready toast.

### Phase 6 — Latency & pricing states
- Inspiration cards: no precise prices (or "from €X").
- On entering the itinerary, show the existing `ItineraryBuildLoader` / skeletons until the (mock) draft is "priced," then reveal totals in `StickySummaryBar`.
- **Acceptance:** no precise total is shown before the itinerary stage; loading state bridges the reveal.

### Phase 7 — Polish & QA
- Accessibility (WCAG 2.1 AA target): the ready toast is announced to screen readers (`role="status"`/`aria-live="polite"`); the control is a real focusable button; the pill is keyboard-operable; focus moves sensibly on peek/switch.
- Reduced motion: all transitions degrade (reuse the existing `useReducedMotion` pattern).
- Mobile-first check at 390px and desktop at ≥1024px.
- Persona seam: confirm a `mode` prop threads from Discovery (default `"consumer"`); `"agent"` is stubbed only.
- **Acceptance:** keyboard + screen-reader pass on the ready moment and the peek/switch; reduced-motion path verified.

---

## 5. Out of scope (do NOT build now)
- Real NLP / LLM calls — keep the scripted/seeded conversation in `useAiPlanState`.
- Real Dynamic Packaging pricing or supplier calls — mock data only.
- The full agent-mode experience — stub the `mode` prop only.
- New checkout — reuse the existing `AiCanvasCheckoutModal`.
- Translations — hardcoded English is fine for the prototype (note where i18n keys would go, per `smartplanner.[component].[purpose].[name]`).

---

## 6. Open questions for Paula (small — don't block on these)
1. **Before "ready," do we hint the itinerary is forming?** Prototype uses a brief "Building your trip…" shimmer. Keep it, or pure surprise reveal?
2. **Desktop: when the conversation is re-opened after switch, does it overlay the itinerary or split 40/60 again?** Recommendation: overlay/side sheet, to preserve "one room."
3. **Brief chips — editable inline (tap a chip to change dates) or display-only for v1?** Recommendation: display-only for v1.

---

## 7. Definition of done
- Discovery → AI Experience → "Plan my trip" → conversation-first surface.
- Itinerary appears only at readiness; "Your itinerary is ready!" fires once.
- One control peeks on mobile, switches on desktop; conversation stays reachable; edits update quietly.
- Demo stage switcher gone from the normal path.
- Matches `ai-discovery-flow-prototype.html` in behavior; uses real stack (React 19, Tailwind v4, shadcn/ui, Framer Motion); builds clean (`tsc` + Vite) with no new lint errors.
