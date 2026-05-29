# Agent Path — dropped from the AI Experience (2026-05-26)

This document records the **Agent path** that previously lived inside the AI Itinerary flow. We dropped it from the user-facing flow as part of the AI Experience redesign (Prototype.html handoff).

> **Update 2026-05-28:** the legacy component files were removed in a design-lint cleanup pass. They were never committed to git, so they're no longer recoverable from history. If you need to rebuild the agent path, treat the descriptions below as a re-build spec — they're the source of truth for what the components did and how they connected.

If you're reading this because you want the agent flow back, jump to **[Revival steps](#revival-steps)** at the bottom.

---

## What the agent path was for

The AI Itinerary flow had **two audiences**:

- **Traveller** — an end-customer planning their own trip. Conversational input, inspiration cards, vibes.
- **Agent** — a travel-agency operator building an itinerary on behalf of a customer (e.g. responding to an email enquiry, cloning a previous trip, applying a template). Wanted structured intake instead of free-text chat.

The audience was picked at the very start (TripSpark Screen 1) and threaded through the rest of the flow as an `AudienceMode = "traveller" | "agent"` prop. Agent mode unlocked a **Quick Build** structured-form screen between Spark and Conversation, and changed the AI's tone in the conversation itself.

---

## Components that made it work

These files **previously lived** at [src/modules/smartPlanner/components/aiItinerary/](src/modules/smartPlanner/components/aiItinerary/) and `src/modules/smartPlanner/hooks/`. They were deleted in the 2026-05-28 cleanup and were never tracked in git, so the source code is gone — the descriptions below are the build spec for re-creating them.

### `TripSpark.tsx` (agent variant)

Top of the screen had a segmented toggle between **Traveller** and **Agent**. Switching to Agent swapped the body of the page:

- **Heading** changed from "What kind of trip are you dreaming of?" to "Build a trip for a customer".
- **Prompt input** placeholder changed to "Paste a customer email or describe the trip…".
- **Body content** swapped from 8 inspiration cards + trending destinations to **3 quick-start cards** + a **recent templates** list:
  - "From email" (lucide `Mail`) — opened a modal to paste a customer email body.
  - "From template" (lucide `FileText`) — jumped to the Quick Build form pre-filled with a saved template.
  - "Clone trip" (lucide `Copy`) — opened a search to copy a previously-built itinerary.
- Submitting the prompt or tapping a quick-start went to **`agent-build`** instead of **`conversation`**.

The toggle was driven by `mode: AudienceMode` and `onModeChange` props.

### `AgentQuickBuild.tsx` (Screen between Spark and Conversation)

A long structured form with four sections:

1. **Trip details** — destination dropdown, date range (`react-day-picker`), travellers (adults + children select), budget min/max (dual-handle slider).
2. **Travel style** — up to 3 multi-select toggles from a set of style tags (beach, nature, culture, food, wellness, family, adventure, shopping).
3. **Pace & preferences** — two sliders (`Relaxed ↔ Packed`, `Budget ↔ Luxury`), plus an optional "Special requests" textarea.
4. **Generation options** — variant count (1 / 2 / 3) and a "use preferred suppliers" switch.

**Form payload** lived in the [`QuickBuildFormData`](src/modules/smartPlanner/components/aiItinerary/types.ts) interface (still exported, just unused). Submitting fired `onGenerate(data)`.

### `AiItineraryPage.tsx` state machine

```
spark ─(traveller variant: prompt or inspiration tap)──► conversation
spark ─(agent variant: prompt or "From Template")─────► agent-build
agent-build ─(generate)───────────────────────────────► conversation
```

`handleAgentGenerate(data)` synthesised the form into a natural-language prompt:

```
Build a {adults}+{children}-traveller trip to {destination} with a budget
around ${avg}. Style: {styles}. Notes: {specialRequests}.
```

…and fed it into the conversation screen as the first user message, so the downstream AI canvas worked identically regardless of which path the user took.

### `ConversationScreen.tsx` `mode` prop

The conversation also took `mode: AudienceMode` and forwarded it to `useAiChat`. The hook used it to pick agent-flavoured AI replies (more operational, less aspirational) and agent-flavoured suggestion chips ("Apply preferred supplier", "Mirror customer dates", etc.).

### `App.tsx` plumbing

```ts
const [aiInitialMode, setAiInitialMode] = useState<AudienceMode>("traveller");

const handleAiPlannerStart = (prompt: string, mode: AudienceMode = "traveller") => {
  setAiInitialPrompt(prompt);
  setAiInitialMode(mode);
  setCurrentPage("ai-itinerary");
};

// passed into <AiItineraryPage initialMode={aiInitialMode} … />
```

The Discovery page never actually exposed the mode picker — the toggle only lived inside `TripSpark`. So in practice the agent flow was only reachable by toggling on inside TripSpark.

---

## What's left in the repo

Nothing was deleted. These files remain unimported but compile-clean:

- [src/modules/smartPlanner/components/aiItinerary/AgentQuickBuild.tsx](src/modules/smartPlanner/components/aiItinerary/AgentQuickBuild.tsx)
- [src/modules/smartPlanner/components/aiItinerary/TripSpark.tsx](src/modules/smartPlanner/components/aiItinerary/TripSpark.tsx) — also previously hosted the traveller variant. The new entry composer ([AiMoodboardComposer.tsx](src/modules/smartPlanner/components/aiItinerary/AiMoodboardComposer.tsx)) is wholly different and starts the conversation directly from Discovery, so TripSpark is dead in both variants.
- [src/modules/smartPlanner/components/aiItinerary/types.ts](src/modules/smartPlanner/components/aiItinerary/types.ts) — still exports `AudienceMode`, `QuickBuildFormData`. Unused but harmless.

---

## Revival steps

If you want the agent flow back, you'll need to **rebuild the deleted components from scratch** using this doc + [AI-ITINERARY-BUILD-SPEC.md](AI-ITINERARY-BUILD-SPEC.md) as the spec. Then wire them in:

1. **Rebuild the components** described above (TripSpark agent variant, AgentQuickBuild, the legacy `useAiChat` hook with the `mode` parameter, etc.).
2. **App.tsx** — restore an `aiInitialMode` state and a two-arg `handleAiPlannerStart(prompt, mode)` signature. Pass `initialMode={aiInitialMode}` into `<AiItineraryPage />`.
3. **AiItineraryPage.tsx** — bring back a `Screen = "spark" | "conversation" | "agent-build"` state machine with `mode`/`setMode` state and the `handleStartAgentBuild` / `handleAgentGenerate` transitions. Render `<TripSpark />` as the spark screen and `<AgentQuickBuild />` for the agent-build screen.
4. **DiscoveryPage.tsx** — decide whether the Discovery entry should expose mode picking. Today, the new `AiMoodboardComposer` always submits as traveller. To let agents enter the flow as agents, add a toggle inside the composer (or a separate "I'm an agent" button) and pipe the mode through `onAiPlannerStart`.
5. **ConversationScreen.tsx** — current code doesn't carry a `mode` prop. To bring back tone-switching, add the prop and thread it into your rebuilt chat-state hook.

The current chat-state hook `useAiPlanState` is traveller-only by design. To support agents you'll likely want to extend it to accept `mode` and branch its `ACTIONS` map, or fork it into a separate `useAgentPlanState`.

---

## Why we dropped it

Per the [Claude Design handoff](.) (May 2026), Paula wanted to focus the AI experience on the **traveller** journey: a clean moodboard composer at entry, then a conversation-driven canvas. The agent's structured intake didn't fit that vision — and Quick Build duplicates a lot of what Cockpit already does. The agent flow may re-emerge as a separate Cockpit feature later instead of living inside the customer-facing AI Experience.
