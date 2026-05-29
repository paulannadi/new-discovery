# TripBuilder AI — Itinerary Creation Experience
## Concept Document · May 2026

---

## 1. Executive Summary

This document proposes an AI-powered itinerary creation experience for TripBuilder that serves **both** end travellers (B2C) and travel agents (B2B) through a unified AI engine with two distinct interaction modes. The concept is informed by competitive analysis of Layla, Mindtrip, and other AI travel planning tools, adapted for Nezasa's unique position as a B2B platform that also powers consumer-facing experiences.

**The core idea:** Instead of a chat-only approach (like Layla) or a visual-curation approach (like Mindtrip), TripBuilder AI uses a **"Conversation + Canvas" pattern** — a split-screen experience where natural language input on one side instantly shapes a living itinerary on the other. This bridges the gap between inspiration and action, and works for both travellers who want ease and agents who need speed.

---

## 2. Competitive Landscape — What We Learned

### Layla (B2C · Chat-First)
**What works:**
- Conversational UX is the core — feels like messaging a friend
- Speed to first draft is excellent (under a minute)
- Short video content (Reels-style) for each suggestion adds emotional resonance
- Live pricing from Skyscanner/Booking.com builds trust
- Follow-up questions before generating make plans feel guided

**What doesn't:**
- Output is often shallow — basic itineraries that need significant refinement
- No real trade-off analysis ("why this hotel zone over that one?")
- Purely linear: chat in → itinerary out. No spatial/visual planning
- No collaboration features
- Weak on complex multi-city routing

**Takeaway for us:** Layla proves that **speed and conversational simplicity** are powerful. Travellers want momentum, not a research system. But the output needs more depth than Layla provides.

### Mindtrip (B2C · Visual + Collaborative)
**What works:**
- Map-centric itinerary visualization — see your trip geographically in real time
- "Start Anywhere™" — begin planning from a URL, photo, screenshot, or PDF
- Strong collaboration: group chat, shared editing, adding ideas together
- Collections for organizing inspiration by theme or destination
- Receipt organization — upload confirmations, keep everything in one place
- 11M+ points of interest database
- "Concierge-like" conversational tone — polished but approachable

**What doesn't:**
- Better at curation than decision-making (organizing options ≠ choosing between them)
- Hotel filters don't always work correctly
- No real-time pricing data
- No flight booking integration (being added via Sabre partnership)
- Can feel like a beautiful planning surface that still leaves hard choices to the user

**Takeaway for us:** Mindtrip proves that **visual, spatial planning** matters enormously. Seeing your trip on a map changes how you think about it. Their collaboration model is also smart. But they stop short of the decision-making layer — which is exactly where agents add value.

### B2B AI Tools (mTrip, TourConnect, Simplified.Travel)
**What works:**
- AI reads unstructured booking documents (emails, GDS output, PDFs) and converts to structured itineraries
- White-label capability — agents can brand the output
- Integration with existing mid-office and GDS systems
- Focus on automating the tedious parts (data entry, formatting) rather than replacing the agent

**What doesn't:**
- Most are document-processing tools, not creative planning assistants
- No consumer-facing component
- Lack the conversational, inspiration-driven experience of B2C tools

**Takeaway for us:** B2B tools validate that agents need **speed and automation** for repetitive tasks, but they're missing the creative, experience-design dimension that makes travel planning engaging.

---

## 3. The Opportunity Gap

The market has a clear split:

| | B2C Tools (Layla, Mindtrip) | B2B Tools (mTrip, TourConnect) |
|---|---|---|
| **Strength** | Inspiration, conversation, visual planning | Automation, document parsing, GDS integration |
| **Weakness** | Shallow on hard decisions, no agent tools | No creative/experiential planning |
| **User** | Individual traveller | Travel agent |
| **Output** | Starter itinerary (needs work) | Structured booking data (needs personality) |

**Nezasa's opportunity is the middle:** a planning AI that combines the conversational ease and visual richness of B2C tools with the real inventory, pricing accuracy, and professional workflow that agents need. One AI engine, two modes.

---

## 4. Proposed Concept: "Conversation + Canvas"

### 4.1 The Core Pattern

The experience uses a **split-panel layout** (or stacked on mobile):

```
┌─────────────────────┬──────────────────────────────┐
│                     │                              │
│   💬 CONVERSATION   │   🗺 LIVE ITINERARY CANVAS   │
│                     │                              │
│   Chat input        │   Map view                   │
│   AI responses      │   Day-by-day timeline        │
│   Follow-up Qs      │   Hotel/activity cards       │
│   Quick actions      │   Budget summary             │
│   Suggestions       │   Alternative options         │
│                     │                              │
└─────────────────────┴──────────────────────────────┘
```

**The key insight:** The canvas updates in real-time as the conversation progresses. When the AI suggests "3 nights in Rome followed by 2 in Florence," the map animates the route, hotel cards appear, and the timeline fills in — all while the user is still chatting. This creates a feeling of **building together** rather than submitting a request and waiting.

### 4.2 Traveller Mode (B2C)

The traveller-facing experience is warm, visual, and low-friction. It's accessible from Discovery pages, white-label partner sites, or directly within Smart Planner.

**Entry points:**
1. **Open chat** — "Plan my dream trip to Japan" (Layla-style free text)
2. **Inspiration card** — Tap a destination/tour card and say "Something like this but for 2 weeks"
3. **Import** — Paste a link, upload a screenshot, or share a Pinterest board (Mindtrip's "Start Anywhere" concept)

**Conversation flow:**
```
User: "We want to go to Italy for our anniversary. 10 days in September."

AI: "Beautiful choice for September! Let me help shape this.
     A few quick questions to get us started:"

     [Card: Travel Style]
     ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
     │ 🏛 Culture   │ │ 🍷 Food &     │ │ 🏖 Relaxation│
     │  & History  │ │   Wine       │ │  & Beach    │
     └─────────────┘ └──────────────┘ └─────────────┘

     [Card: Pace]
     ┌──────────────┐ ┌──────────────┐
     │ 🐢 Slow &     │ │ 🏃 See it     │
     │   Relaxed    │ │   all!       │
     └──────────────┘ └──────────────┘

Meanwhile, the canvas starts showing Italy on the map with
popular routes softly highlighted...
```

**Progressive disclosure:** Instead of asking 10 questions upfront (which kills momentum), the AI asks 2-3 initial questions, generates a first-draft itinerary, and then refines through follow-up conversation. This matches Layla's speed while achieving Mindtrip's depth.

**Visual richness:** Each destination/hotel/activity card includes photos, brief descriptions, and a reason ("We picked this because you said you love food — this neighbourhood is where locals eat"). This is the emotional layer Mindtrip does well.

### 4.3 Agent Copilot Mode (B2B)

The agent-facing experience prioritises speed, control, and professional output. It lives within Smart Planner and Cockpit.

**Entry points:**
1. **Paste a customer request** — Agent pastes an email or brief, AI extracts intent and generates an itinerary
2. **Structured quick-build** — Agent fills a compact form (destination, dates, pax, budget, style), AI generates instantly
3. **Clone + modify** — Start from an existing itinerary and tell AI what to change
4. **Template generation** — "Give me 3 versions of a 7-day Bali trip: budget, mid-range, luxury"

**Key differences from traveller mode:**
- **Real inventory access** — AI searches actual TripBuilder inventory (hotels, activities, transfers) and shows live availability and pricing
- **Multi-variant generation** — Agent can request 2-3 itinerary variants at once to present to the client
- **Professional annotations** — AI adds agent-facing notes ("This hotel has a 15% commission" or "Client mentioned dietary restrictions — flagged at restaurant suggestions")
- **One-click client share** — Generate a polished, branded itinerary link the agent can send to the traveller
- **Constraint awareness** — AI understands operator-specific rules (preferred suppliers, margin requirements, blackout dates)

**Agent workflow example:**
```
Agent: [Pastes email]
"Hi, we're a family of 4 (kids aged 8 and 12). Looking for
10 days in Bali, mid-range budget around $5000 total.
We love nature but the kids need pool time too."

AI: "Got it — here's what I'm building:

     👨‍👩‍👧‍👦  4 pax (2 adults, 2 children 8 & 12)
     📅  10 nights · Need dates — shall I suggest October?
     💰  ~$5,000 total ($500/night budget)
     🎯  Nature + family pools

     Generating itinerary with your preferred Bali suppliers..."

[Canvas shows: Map with Ubud + Seminyak route,
 3 hotel options per stop, family activity suggestions,
 transfer logistics, running cost total]

Agent: "Swap the Seminyak hotel for the Alila — better
commission and they have a kids club"

AI: [Instantly swaps, recalculates pricing]
    "Done. Total moves from $4,850 to $5,120. The Alila
     also has complimentary breakfast which offsets the
     difference. Want me to generate the client proposal?"
```

### 4.4 The Live Canvas (Shared Component)

The canvas is the same underlying component for both modes, but styled differently:

**For Travellers:**
- Emphasis on photos, emotional descriptions, and "vibe"
- Map shows routes with scenic highlight markers
- Cards show "Why we picked this" explanations
- Budget shown as a simple high/medium/low indicator

**For Agents:**
- Emphasis on logistics, pricing, and availability
- Map shows transfer times and connection points
- Cards show supplier names, commission rates, and booking status
- Budget shown as detailed line-item breakdown

**Canvas features (both modes):**
- **Interactive map** — Zoomable, shows the full route with numbered stops
- **Day-by-day timeline** — Vertical timeline with expandable day cards
- **Drag-to-reorder** — Users can drag days, hotels, or activities to rearrange
- **Alternatives drawer** — Each item shows "2 alternatives" that can be swapped in with one click
- **Running budget** — Updates in real time as items are added/swapped
- **AI suggestions strip** — Contextual suggestions appear at the bottom ("Add a free day?" "This route could save 2 hours if you swap days 4 and 5")

---

## 5. Interaction Design Principles

### 5.1 "Show, Don't Tell"
Unlike Layla (which describes an itinerary in chat text), our AI immediately renders its suggestions visually. When the AI says "I'd recommend starting in Rome," Rome appears on the map, hotel cards slide in, and the timeline starts forming. The conversation is a steering wheel, the canvas is the windshield.

### 5.2 "Progressively Complex"
Start simple, add depth on demand. The first interaction is as easy as typing a sentence. But the system supports deep refinement — swap hotels, adjust routing, compare price points, add specific experiences — without ever requiring the user to leave the experience.

### 5.3 "Transparent Reasoning"
Every AI suggestion includes a brief "why" — not buried in a paragraph, but as a small annotation. "This hotel: 4.5★, 8 min walk to the centre, within your budget" or "Moved this activity to Day 3 because Tuesday is the only day it runs." This builds trust and helps agents justify choices to clients.

### 5.4 "Continuous, Not Sequential"
The AI doesn't disappear after generating the initial itinerary. It remains as a persistent copilot throughout the Smart Planner workflow. Users can invoke it at any point: "Find me a better hotel for night 3," "What's the weather like in Bali in October?," "Add a cooking class somewhere in the Tuscany days."

### 5.5 "Respect the Agent's Expertise"
In B2B mode, the AI is explicitly a copilot, not a replacement. It generates drafts and suggestions, but the agent retains full control. The AI never auto-books or makes irreversible changes. It's a power tool, not an autopilot.

---

## 6. Entry Experience — The "Trip Spark"

The very first screen the user sees is critical. Rather than a blank chat input (which can feel intimidating), we propose a **"Trip Spark"** landing state:

### For Travellers:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│          Where will your next story begin?          │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ 💬 Tell me about your dream trip...          │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Or start with an idea:                            │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 🌴        │ │ 🏔        │ │ 🏛        │          │
│  │ Beach     │ │ Adventure│ │ Cultural  │          │
│  │ Escape   │ │ Trip     │ │ Journey  │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 👨‍👩‍👧‍👦       │ │ 💑        │ │ 🚗        │          │
│  │ Family   │ │ Romantic │ │ Road     │          │
│  │ Holiday  │ │ Getaway  │ │ Trip     │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                    │
│  📎 Paste a link or upload inspiration             │
│                                                    │
└────────────────────────────────────────────────────┘
```

### For Agents:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  🎧 Build an Itinerary                             │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📋 Paste customer request or describe the     │  │
│  │    trip...                                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Quick start:                                      │
│                                                    │
│  [📧 From Email]  [📄 From Template]  [🔄 Clone Trip] │
│                                                    │
│  Recent templates:                                 │
│  • Bali Family 10D  •  Europe Highlights 14D       │
│  • Japan Culture 7D  •  Safari + Beach 12D         │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 7. AI Conversation Patterns

### 7.1 Smart Follow-Up Questions
Instead of asking everything upfront, the AI uses **progressive disclosure cards** — visual, tappable options that feel more like browsing than form-filling:

| Phase | What AI asks | Format |
|---|---|---|
| **1. Intent** | Where + when + who | Free text or tappable cards |
| **2. Style** | Trip vibe, pace, interests | Visual picker (icons + labels) |
| **3. First draft** | AI generates itinerary | Canvas populates |
| **4. Refinement** | AI suggests improvements | Inline suggestions on canvas |
| **5. Deep customisation** | User makes specific swaps | Chat + direct canvas interaction |

### 7.2 Handling Vague Requests
When travellers say something vague like "Plan me a trip," the AI doesn't dump a questionnaire. Instead:

```
AI: "I'd love to! Let's start with the basics —
     where are you thinking? If you're not sure yet,
     I can suggest some destinations based on what
     kind of experience you're after."

     [Show me destinations for:]
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ September  │ │ Warm       │ │ Under      │
     │ travel     │ │ weather    │ │ $3,000     │
     └────────────┘ └────────────┘ └────────────┘
```

### 7.3 Constraint Negotiation
When the budget doesn't match the request, the AI negotiates transparently:

```
User: "5-star hotels in Santorini for a week, budget $2,000"

AI: "Santorini 5-star hotels in peak season typically start
     at ~$400/night, which would be $2,800 for 7 nights —
     over your $2,000 budget. Here are three options:

     💡 Option A: 5-star for 4 nights + boutique for 3 ($2,100)
     💡 Option B: Shoulder season dates where 5-star drops to $280/night
     💡 Option C: Nearby Naxos — similar vibe, 5-star at $250/night

     Which direction appeals to you?"
```

---

## 8. How It Flows into Smart Planner

The AI experience is the **on-ramp** to Smart Planner, not a replacement for it.

```
AI Creates Draft  →  Handoff to Smart Planner  →  Full Planning Tools
                     ↑
                     AI copilot stays available
                     as a sidebar assistant
```

**The handoff moment:** When the user is happy with the AI-generated itinerary, they click "Continue Planning" (traveller) or "Open in Workspace" (agent). The itinerary transfers into Smart Planner with all the structure intact — days, hotels, activities, transfers — and the user can now use all the existing Smart Planner tools (booking, pricing, client sharing, etc.).

**The AI doesn't leave.** It remains accessible as a collapsible sidebar/panel. At any point during Smart Planner, the user can ask: "Find alternatives for this hotel," "What should we do on the free afternoon in Day 5?," or "Is this itinerary too packed?"

---

## 9. What Makes This Different from Layla / Mindtrip

| Dimension | Layla | Mindtrip | TripBuilder AI (ours) |
|---|---|---|---|
| **Primary input** | Chat only | Chat + visual curation | Chat + form + import |
| **Output style** | Text-based itinerary | Map + cards | Split canvas (map + timeline + cards) |
| **Real inventory** | No (aggregator links) | Partial | Yes (live TripBuilder inventory) |
| **Agent support** | None | None | Full copilot mode |
| **Decision support** | Weak | Moderate | Strong (trade-off analysis + "why") |
| **Booking** | Links to partners | Coming soon | Native (through Smart Planner) |
| **Collaboration** | None | Group chat + shared editing | Agent ↔ traveller review flow |
| **Post-generation** | Static output | Basic editing | Full Smart Planner toolkit + persistent AI |
| **White-label** | No | For hotels (B2B) | Full white-label for operators |

---

## 10. Key UX Screens to Prototype

For the prototype phase, I recommend building these screens in priority order:

1. **Trip Spark** — The entry/landing state with chat input and inspiration cards
2. **Conversation + Canvas (split view)** — The core AI interaction with live-updating itinerary
3. **Day Card** — Expandable day view showing hotels, activities, and transfers with swap/alternative options
4. **Agent Quick Build** — The structured intake form for agents
5. **Handoff Moment** — The transition animation/state from AI canvas into Smart Planner

---

## 11. Technical Considerations for Prototyping

Since these are prototypes (not production code), we can simplify:

- **Chat**: Simulated AI responses with realistic timing/streaming
- **Canvas**: React components with mock data, using the real shadcn/ui + Tailwind stack
- **Map**: Static map images or a simple Mapbox/Leaflet integration
- **Drag-and-drop**: Could use `@dnd-kit` (already common in React) or simplify to click-to-reorder
- **Split panel**: CSS Grid or Flexbox with a resizable divider

All prototypes should follow the TripBuilder design system and use the existing component library where possible.

---

## 12. Open Questions

1. **Voice input?** — Should travellers be able to speak their trip idea? (Mobile advantage)
2. **Multi-language?** — The AI conversation should support the same languages as TripBuilder (i18next is already in the stack)
3. **Memory across sessions?** — Should the AI remember previous trips and preferences? ("You enjoyed boutique hotels last time — shall I focus on those again?")
4. **Operator customisation?** — Can operators configure the AI's personality, default suggestions, and constraint rules per white-label instance?
5. **Where does it live?** — Is this a new route/page in Smart Planner, or a modal/overlay that can be triggered from anywhere?

---

## Sources

- [Layla AI](https://layla.ai/)
- [Mindtrip AI](https://mindtrip.ai/)
- [Layla AI Review 2026 — SearchSpot](https://www.searchspot.ai/blog/layla-ai-review-2026)
- [Mindtrip AI Review 2026 — SearchSpot](https://www.searchspot.ai/blog/mindtrip-ai-review-2026)
- [UX Meets Luxury: Itinerary Visualization in Mindtrip — Resident](https://resident.com/tech-and-gear/2025/10/29/ux-meets-luxury-the-art-of-itinerary-visualization-in-mindtripai)
- [Mindtrip Agentic AI Flight Booking — Sabre](https://www.sabre.com/resources/newsroom/mindtrip-launches-travels-first-all-in-one-agentic-ai-flight-booking-experience-powered-by-partnership-with-sabre-and-paypal/)
- [AI-Powered Itinerary Builder — mTrip](https://www.mtrip.com/ai-powered-itinerary-builder/)
- [AI Itinerary Builder for Tour Operators — Simplified.Travel](https://www.simplified.travel/itinerary-planner-for-tour-operators)
