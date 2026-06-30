// AiItineraryPage — host for the AI Itinerary "Conversation + Canvas" screen.
//
// Reached from Discovery's "Plan my trip" CTA when AI Experience mode is on.
// The composer on Discovery (AiMoodboardComposer) already collects everything
// we need to seed the conversation, so this page is now a thin wrapper that
// just renders the split-view screen and provides a "back to Discovery" hook.
//
// History: there used to be a 3-screen state machine (TripSpark spark screen +
// AgentQuickBuild form + Conversation). The agent path was dropped in the
// May 2026 redesign — see AGENT_PATH.md at repo root for the full record and
// revival steps.

import ConversationScreen from "../components/aiItinerary/ConversationScreen";

interface AiItineraryPageProps {
  // Back button at the top of the screen → returns to the host app
  // (typically Discovery in App.tsx).
  onBack: () => void;
  // Pre-filled prompt — the brief composed in the moodboard composer on
  // Discovery. Becomes the first user message in the conversation.
  initialPrompt?: string;
  // Persona seam (Phase 7). Defaults to the B2C guided "consumer" experience.
  // The "agent" variant is stubbed only for now (see ConversationScreen).
  mode?: "consumer" | "agent";
}

export default function AiItineraryPage({
  onBack,
  initialPrompt,
  mode = "consumer",
}: AiItineraryPageProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <ConversationScreen
        seedPrompt={initialPrompt ?? ""}
        onNewTrip={onBack}
        mode={mode}
      />
    </div>
  );
}
