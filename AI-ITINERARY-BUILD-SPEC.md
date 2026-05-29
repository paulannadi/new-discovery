# AI Itinerary Creation Flow — Claude Code Build Spec

> **Purpose:** This is a step-by-step implementation spec for Claude Code. Build a 3-screen prototype flow for AI-powered itinerary creation inside the TripBuilder frontend repo (`nezasa/tripbuilder-itinerary-frontend`).
>
> **Read first:** `AI-Itinerary-Experience-Concept.md` in this same folder for the full design rationale.

---

## Tech Stack (use what the repo already has)

- React 19 + TypeScript 5.7
- Vite 6
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- React Router v7
- Framer Motion (animations)
- i18next (translations — hardcoded English is fine for prototype)

---

## File Structure

Create all files under `src/modules/smartPlanner/`. Follow the existing repo conventions.

```
src/modules/smartPlanner/
├── pages/
│   └── AiItineraryPage.tsx          ← Router page, manages flow state
├── components/
│   └── aiItinerary/
│       ├── TripSpark.tsx            ← Screen 1: Entry/landing
│       ├── ConversationPanel.tsx    ← Screen 2 left: Chat interface
│       ├── ItineraryCanvas.tsx      ← Screen 2 right: Live itinerary
│       ├── CanvasDayCard.tsx        ← Day card inside canvas
│       ├── CanvasMapPlaceholder.tsx ← Map placeholder (static image)
│       ├── CanvasBudgetBar.tsx      ← Budget summary strip
│       ├── AgentQuickBuild.tsx      ← Screen 3: Agent structured intake
│       ├── ChatMessage.tsx          ← Single message bubble
│       ├── ChatInput.tsx            ← Text input + send button
│       ├── StylePicker.tsx          ← Tappable card grid (travel style)
│       ├── SuggestionChips.tsx      ← Contextual suggestion pills
│       └── types.ts                 ← Shared TypeScript types
├── hooks/
│   └── useAiChat.ts                 ← Chat state + simulated AI responses
```

---

## Route Setup

Add a route to the app's router config:

```tsx
// Path: /smart-planner/ai-create
// Component: AiItineraryPage
```

If the router config is in `src/router.tsx` or similar, add the route there. If you can't find it, create the page component and note where the route should be added.

---

## Screen 1: Trip Spark (Entry State)

**File:** `TripSpark.tsx`

**What it is:** The landing screen users see first. Two variants — traveller and agent — toggled by a small switch at the top.

### Traveller variant layout:
```
┌─────────────────────────────────────────────────────────┐
│  [Traveller ● | ○ Agent]              (toggle switch)   │
│                                                         │
│              ✈ Where will your next                     │
│                story begin?                             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 💬 Tell me about your dream trip...    [→ Send]   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Or start with an idea:                                 │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 🌴        │ │ 🏔        │ │ 🏛        │ │ 🍷        │  │
│  │ Beach    │ │ Adventure│ │ Culture  │ │ Food &   │  │
│  │ Escape   │ │          │ │ & History│ │ Wine     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 👨‍👩‍👧‍👦       │ │ 💑        │ │ 🚗        │ │ 🎒        │  │
│  │ Family   │ │ Romantic │ │ Road     │ │ Solo     │  │
│  │ Holiday  │ │ Getaway  │ │ Trip     │ │ Explorer │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ──── or ────                                          │
│                                                         │
│  📎 Paste a link or upload an image for inspiration     │
│                                                         │
│  ─── Trending destinations ───                         │
│  [Bali 🌴] [Japan 🏯] [Italy 🍕] [Morocco 🕌]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Agent variant layout:
```
┌─────────────────────────────────────────────────────────┐
│  [○ Traveller | Agent ●]              (toggle switch)   │
│                                                         │
│              🎧 Build an Itinerary                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📋 Paste customer request or describe the trip... │  │
│  │                                                   │  │
│  │                                          [→ Go]   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Quick start:                                           │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 📧 From      │ │ 📄 From       │ │ 🔄 Clone     │   │
│  │   Email      │ │   Template   │ │   Trip       │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  Recent templates:                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Bali Family 10D · Mid-range · Last used 2d ago  │   │
│  │ Europe Highlights 14D · Luxury · Last used 1w   │   │
│  │ Japan Culture 7D · Budget · Last used 2w ago    │   │
│  │ Safari + Beach 12D · Luxury · Last used 3w     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation notes:
- Use shadcn `Toggle` or `Tabs` for the Traveller/Agent switch
- Inspiration cards: use shadcn `Card` with hover scale effect (Framer Motion `whileHover={{ scale: 1.03 }}`)
- Chat input: shadcn `Input` with a `Button` (icon-only, arrow-right)
- Trending destinations: horizontal scroll of shadcn `Badge` components
- Clicking a card or typing + sending transitions to Screen 2

### Behaviour:
- Typing in the input and pressing Enter/Send → transition to Screen 2 (Conversation + Canvas) with the message pre-loaded
- Clicking an inspiration card → transition to Screen 2 with a pre-filled message like "I'm looking for a beach escape"
- Agent "From Email" → opens a textarea modal to paste email content
- Agent "From Template" → shows template list (mock data, not functional)

---

## Screen 2: Conversation + Canvas (Split View)

**Files:** `ConversationPanel.tsx` + `ItineraryCanvas.tsx` (composed together in `AiItineraryPage.tsx`)

**What it is:** The core experience. Chat on the left, live-updating itinerary on the right. The canvas populates as the AI "responds."

### Layout:
```
┌──────────────────────────┬───────────────────────────────────┐
│  💬 Conversation         │  🗺 Itinerary Canvas              │
│                          │                                   │
│  ┌────────────────────┐  │  ┌─────────────────────────────┐ │
│  │ User: Plan my      │  │  │  [Map Placeholder]          │ │
│  │ honeymoon in Italy, │  │  │  Italy route:               │ │
│  │ 10 days, Sept      │  │  │  Rome → Florence → Amalfi   │ │
│  └────────────────────┘  │  └─────────────────────────────┘ │
│                          │                                   │
│  ┌────────────────────┐  │  Budget: $4,200 / $5,000         │
│  │ AI: Beautiful! A   │  │  ████████████░░░ 84%             │
│  │ few questions...   │  │                                   │
│  │                    │  │  ┌─ Day 1-3: Rome ──────────────┐│
│  │ [Style Picker]     │  │  │ 🏨 Hotel Minerva ★★★★        ││
│  │ 🏛 Culture         │  │  │    $180/night · Centro Storico││
│  │ 🍷 Food            │  │  │ 📍 Colosseum, Vatican, Trevi ││
│  │ 🏖 Beach           │  │  │ 🍽 Trastevere food tour      ││
│  └────────────────────┘  │  │ [Swap hotel] [See 2 alts]    ││
│                          │  └────────────────────────────────┘│
│  ┌────────────────────┐  │                                   │
│  │ AI: Here's your    │  │  ┌─ Day 4-6: Florence ─────────┐│
│  │ first draft!       │  │  │ 🏨 Palazzo Guadagni ★★★★     ││
│  │ Take a look at     │  │  │    $160/night · Oltrarno     ││
│  │ the itinerary →    │  │  │ 📍 Uffizi, Ponte Vecchio     ││
│  └────────────────────┘  │  │ 🍷 Chianti day trip          ││
│                          │  │ [Swap hotel] [See 2 alts]    ││
│  Suggestions:            │  └────────────────────────────────┘│
│  [Add free day]          │                                   │
│  [Extend Florence]       │  ┌─ Day 7-10: Amalfi Coast ────┐│
│  [Add cooking class]     │  │ 🏨 Hotel Santa Caterina ★★★★ ││
│                          │  │    $220/night · Amalfi town  ││
│  ┌────────────────────┐  │  │ 📍 Positano, Ravello, boat  ││
│  │ 💬 Type a message  │  │  │ 🍋 Limoncello tasting       ││
│  │              [Send]│  │  │ [Swap hotel] [See 2 alts]   ││
│  └────────────────────┘  │  └────────────────────────────────┘│
│                          │                                   │
│                          │  [✅ Continue to Smart Planner]    │
└──────────────────────────┴───────────────────────────────────┘
```

### Left Panel — ConversationPanel.tsx

**Components used:**
- `ChatMessage.tsx` — message bubble. Props: `role: 'user' | 'ai'`, `content: string`, `timestamp: Date`, `isStreaming?: boolean`
- `StylePicker.tsx` — grid of tappable style cards shown inline in the AI's message. Props: `options: Array<{ icon: string, label: string }>`, `onSelect: (label: string) => void`, `allowMultiple?: boolean`
- `SuggestionChips.tsx` — contextual suggestions below the conversation. Props: `suggestions: string[]`, `onSelect: (text: string) => void`
- `ChatInput.tsx` — bottom-pinned input. Props: `onSend: (message: string) => void`, `placeholder?: string`

**Behaviour:**
- Messages appear with a slight stagger animation (Framer Motion `initial={{ opacity: 0, y: 10 }}`)
- AI messages simulate streaming: text appears word-by-word with a ~30ms delay per word
- When the AI generates the itinerary, the canvas simultaneously populates (use shared state)
- StylePicker and SuggestionChips are interactive — clicking them sends a message automatically
- Conversation scrolls to bottom on new messages

### Right Panel — ItineraryCanvas.tsx

**Components used:**
- `CanvasMapPlaceholder.tsx` — static map image with route overlay. Use a placeholder image of Italy/whatever destination. Props: `destinations: string[]`, `routeLabel?: string`
- `CanvasBudgetBar.tsx` — progress bar showing budget used. Props: `spent: number`, `total: number`, `currency?: string`
- `CanvasDayCard.tsx` — expandable day card. Props:
  ```ts
  {
    dayRange: string        // "Day 1-3"
    location: string        // "Rome"
    hotel: {
      name: string
      stars: number
      pricePerNight: number
      neighbourhood: string
      imageUrl?: string
    }
    activities: Array<{
      icon: string          // emoji
      label: string
    }>
    alternatives: number    // count of alternatives available
    onSwapHotel: () => void
    onShowAlternatives: () => void
  }
  ```

**Behaviour:**
- Canvas is empty/skeleton state initially, populates as AI "generates"
- Day cards animate in sequentially (Framer Motion stagger, 200ms delay between cards)
- "Swap hotel" opens a small popover with 2 alternative hotels (mock data)
- "Continue to Smart Planner" button at bottom — for prototype, this can just show a toast "Handoff to Smart Planner — coming soon"
- On mobile (< 768px): canvas appears below conversation instead of beside it, with a tab switcher: [Chat | Itinerary]

---

## Screen 3: Agent Quick Build

**File:** `AgentQuickBuild.tsx`

**What it is:** A structured form that agents fill out to quickly generate an itinerary. This is reached from the Trip Spark agent variant ("From Template" or filling the main input).

### Layout:
```
┌─────────────────────────────────────────────────────────┐
│  🎧 Quick Build                          [← Back]      │
│                                                         │
│  ┌─ Trip Details ─────────────────────────────────────┐ │
│  │                                                    │ │
│  │  Destination        Dates                          │ │
│  │  [Bali, Indonesia▾] [Oct 15 → Oct 25]             │ │
│  │                                                    │ │
│  │  Travellers         Budget                         │ │
│  │  [2 Adults, 2 Kids] [$3,000 ─●────── $8,000]      │ │
│  │                     Selected: ~$5,000              │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Travel Style (select up to 3) ───────────────────┐ │
│  │                                                    │ │
│  │  [🏖 Beach] [🌿 Nature] [🏛 Culture] [🍷 Food]     │ │
│  │  [🧘 Wellness] [🎢 Family Fun] [🏔 Adventure]      │ │
│  │  [🛍 Shopping]                                     │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Pace & Preferences ──────────────────────────────┐ │
│  │                                                    │ │
│  │  Pace:   [🐢 Relaxed ─────●───── 🏃 Packed]       │ │
│  │  Luxury: [💰 Budget ──●──────── 💎 Luxury]         │ │
│  │                                                    │ │
│  │  Special requests (optional):                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ Kids need pool time. One parent is vegan.    │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Generation Options ──────────────────────────────┐ │
│  │                                                    │ │
│  │  How many variants?   [1] [2] [3]                  │ │
│  │  Use preferred suppliers?  [✓ Yes]                 │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  [🚀 Generate Itinerary]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation notes:
- Use shadcn `Select` for destination, `DatePicker`/`Calendar` for dates
- Travellers: shadcn `Select` with presets ("2 Adults", "2 Adults, 1 Child", etc.) or custom
- Budget: shadcn `Slider` (range) with displayed value
- Travel style: toggle buttons using shadcn `Toggle` in a flex-wrap grid
- Pace/Luxury: shadcn `Slider` components
- Special requests: shadcn `Textarea`
- Variant count: shadcn `RadioGroup` styled as pill buttons
- "Generate Itinerary" → transitions to Screen 2 (Conversation + Canvas) with the form data pre-filled as an AI prompt

---

## Shared State & Hook: useAiChat

**File:** `hooks/useAiChat.ts`

This hook manages the conversation state and simulates AI responses. It also drives the canvas state.

```ts
interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  // For special message types (inline components)
  widget?: 'style-picker' | 'suggestion-chips' | null
  widgetData?: any
}

interface ItineraryState {
  status: 'empty' | 'generating' | 'ready'
  destination: string
  totalBudget: number
  spentBudget: number
  days: DayCard[]
  mapImage: string // URL to static map placeholder
}

interface DayCard {
  id: string
  dayRange: string
  location: string
  hotel: {
    name: string
    stars: number
    pricePerNight: number
    neighbourhood: string
  }
  activities: Array<{ icon: string; label: string }>
  alternativeCount: number
}

function useAiChat() {
  // Returns:
  // - messages: Message[]
  // - itinerary: ItineraryState
  // - sendMessage: (text: string) => void
  // - isAiTyping: boolean
  // - suggestions: string[]
}
```

### Simulated AI conversation flow:

The hook contains a pre-scripted conversation tree. When the user sends a message, it triggers the next step in the flow:

**Step 1 — User sends initial message** (from Trip Spark or typed)
→ AI responds asking about travel style (shows StylePicker widget)
→ Canvas shows skeleton/loading state

**Step 2 — User picks travel style**
→ AI responds asking about pace preference (text message)
→ AI follows up with "Great! Generating your itinerary now..."
→ Canvas starts generating: map appears, then day cards animate in one by one

**Step 3 — Itinerary generated**
→ AI responds "Here's your first draft! Take a look at the itinerary and let me know what to adjust."
→ Suggestion chips appear: ["Add a free day", "Swap a hotel", "Extend in Florence", "Add a cooking class"]
→ Canvas is fully populated

**Step 4 — User clicks a suggestion or types a refinement**
→ AI acknowledges and updates the canvas (e.g., swaps a hotel, adds a day)
→ Budget bar updates accordingly

Use `setTimeout` to simulate response delays (1-2 seconds before AI starts "typing," then word-by-word streaming).

---

## Mock Data

### Italy Honeymoon (Traveller default)
```ts
const ITALY_ITINERARY: DayCard[] = [
  {
    id: 'rome',
    dayRange: 'Day 1–3',
    location: 'Rome',
    hotel: {
      name: 'Hotel Minerva',
      stars: 4,
      pricePerNight: 180,
      neighbourhood: 'Centro Storico',
    },
    activities: [
      { icon: '🏛', label: 'Colosseum & Roman Forum' },
      { icon: '⛪', label: 'Vatican Museums & Sistine Chapel' },
      { icon: '🍝', label: 'Trastevere food tour' },
    ],
    alternativeCount: 2,
  },
  {
    id: 'florence',
    dayRange: 'Day 4–6',
    location: 'Florence',
    hotel: {
      name: 'Palazzo Guadagni',
      stars: 4,
      pricePerNight: 160,
      neighbourhood: 'Oltrarno',
    },
    activities: [
      { icon: '🎨', label: 'Uffizi Gallery' },
      { icon: '🌉', label: 'Ponte Vecchio sunset walk' },
      { icon: '🍷', label: 'Chianti wine day trip' },
    ],
    alternativeCount: 2,
  },
  {
    id: 'amalfi',
    dayRange: 'Day 7–10',
    location: 'Amalfi Coast',
    hotel: {
      name: 'Hotel Santa Caterina',
      stars: 4,
      pricePerNight: 220,
      neighbourhood: 'Amalfi town',
    },
    activities: [
      { icon: '⛵', label: 'Positano boat trip' },
      { icon: '🏔', label: 'Path of the Gods hike' },
      { icon: '🍋', label: 'Limoncello tasting in Ravello' },
    ],
    alternativeCount: 2,
  },
]
```

### Bali Family (Agent default)
```ts
const BALI_ITINERARY: DayCard[] = [
  {
    id: 'ubud',
    dayRange: 'Day 1–4',
    location: 'Ubud',
    hotel: {
      name: 'Alila Ubud',
      stars: 5,
      pricePerNight: 280,
      neighbourhood: 'Payangan',
    },
    activities: [
      { icon: '🌿', label: 'Tegallalang Rice Terraces' },
      { icon: '🐒', label: 'Sacred Monkey Forest' },
      { icon: '🎨', label: 'Batik painting class (family)' },
    ],
    alternativeCount: 2,
  },
  {
    id: 'seminyak',
    dayRange: 'Day 5–7',
    location: 'Seminyak',
    hotel: {
      name: 'W Bali Seminyak',
      stars: 5,
      pricePerNight: 320,
      neighbourhood: 'Seminyak Beach',
    },
    activities: [
      { icon: '🏖', label: 'Beach day + kids surf lesson' },
      { icon: '🛍', label: 'Seminyak shopping' },
      { icon: '🌅', label: 'Tanah Lot sunset temple' },
    ],
    alternativeCount: 2,
  },
  {
    id: 'nusa-dua',
    dayRange: 'Day 8–10',
    location: 'Nusa Dua',
    hotel: {
      name: 'Sofitel Bali',
      stars: 5,
      pricePerNight: 250,
      neighbourhood: 'Nusa Dua Beach',
    },
    activities: [
      { icon: '🤿', label: 'Snorkelling trip' },
      { icon: '🏊', label: 'Pool & resort day' },
      { icon: '💆', label: 'Family spa experience' },
    ],
    alternativeCount: 2,
  },
]
```

### Alternative hotels (for swap popover)
```ts
const ROME_ALTERNATIVES = [
  { name: 'Hotel de Russie', stars: 5, pricePerNight: 350, neighbourhood: 'Piazza del Popolo' },
  { name: 'Hotel Campo de\' Fiori', stars: 3, pricePerNight: 120, neighbourhood: 'Campo de\' Fiori' },
]
```

---

## Styling Guidelines

- **Colours:** Use Tailwind's existing colour palette. Primary accent for traveller mode, secondary accent for agent mode. If the repo has custom theme colours, use those.
- **Spacing:** Follow the existing design system. Default to `p-4` for cards, `gap-3` for grids, `space-y-4` for vertical stacks.
- **Border radius:** Use `rounded-xl` for cards, `rounded-full` for pills/chips.
- **Shadows:** Use `shadow-sm` on cards, `shadow-md` on elevated elements (popovers).
- **Dark mode:** If the repo supports dark mode, make sure the components respect `dark:` variants. Otherwise, light mode only is fine.
- **Typography:**
  - Page titles: `text-2xl font-bold`
  - Section headers: `text-lg font-semibold`
  - Body: `text-sm`
  - Captions/metadata: `text-xs text-muted-foreground`
- **Mobile breakpoint:** Split view collapses to stacked at `md` (768px). Use `md:grid-cols-2` and `grid-cols-1` pattern.

---

## Animation Spec (Framer Motion)

### Page transition (Trip Spark → Conversation):
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Day cards appearing in canvas:
```tsx
// Stagger children
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.2, duration: 0.4 }}
>
```

### Chat messages appearing:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Inspiration cards hover:
```tsx
<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
```

---

## Build Order

Follow this exact order. Each step should result in something visible and testable:

### Step 1: Scaffolding
1. Create the file structure above
2. Create `types.ts` with all shared types
3. Create `AiItineraryPage.tsx` with basic routing state (`screen: 'spark' | 'conversation' | 'agent-build'`)
4. Add the route to the router

### Step 2: Trip Spark
1. Build `TripSpark.tsx` with both traveller and agent variants
2. Wire up the toggle switch
3. Wire up the chat input → sets initial message and transitions to conversation screen
4. Wire up inspiration cards → same transition with pre-filled message

### Step 3: Chat Components
1. Build `ChatMessage.tsx` (user and AI bubble styles)
2. Build `ChatInput.tsx` (input + send button, Enter to send)
3. Build `StylePicker.tsx` (tappable card grid)
4. Build `SuggestionChips.tsx` (horizontal pill list)

### Step 4: useAiChat Hook
1. Build the hook with simulated conversation flow
2. Include word-by-word streaming simulation
3. Include itinerary state that updates when "generating"
4. Wire up the mock data

### Step 5: Conversation Panel
1. Build `ConversationPanel.tsx` composing the chat components
2. Wire up `useAiChat`
3. Test the full conversation flow with simulated responses

### Step 6: Itinerary Canvas
1. Build `CanvasMapPlaceholder.tsx` (static image with destination labels)
2. Build `CanvasBudgetBar.tsx` (progress bar)
3. Build `CanvasDayCard.tsx` (expandable card with hotel + activities)
4. Build `ItineraryCanvas.tsx` composing them together
5. Wire up canvas to shared itinerary state from `useAiChat`

### Step 7: Split View
1. Compose `ConversationPanel` + `ItineraryCanvas` side by side in `AiItineraryPage`
2. Add responsive collapse (stack on mobile with tab switcher)
3. Add "Continue to Smart Planner" button (shows toast for now)

### Step 8: Agent Quick Build
1. Build `AgentQuickBuild.tsx` with all form fields
2. Wire up "Generate Itinerary" → transitions to conversation screen with form data as the initial "user message"

### Step 9: Polish
1. Add all Framer Motion animations
2. Ensure keyboard navigation works
3. Test mobile layout
4. Clean up any TypeScript errors

---

## What NOT to Build (out of scope for prototype)

- Real API calls or AI integration
- Actual map rendering (use placeholder images)
- Booking or payment flows
- User authentication
- Database or persistence
- i18n translations (hardcoded English is fine)
- Unit tests
- Real image loading (use placeholder gradients or Unsplash URLs)

---

## Success Criteria

The prototype is done when:
1. A user can arrive at Trip Spark, pick traveller or agent mode
2. Type or select a trip idea → transition to the Conversation + Canvas view
3. See a simulated AI conversation unfold with tappable options
4. Watch the itinerary canvas populate in real-time alongside the conversation
5. Click suggestion chips to "refine" the itinerary
6. Click "Continue to Smart Planner" (shows confirmation toast)
7. Agent mode: fill the Quick Build form → same canvas experience
8. Everything looks polished, animated, and on-brand with TripBuilder's design system
9. Works on both desktop (split view) and mobile (stacked view)
