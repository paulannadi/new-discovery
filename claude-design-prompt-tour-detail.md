# Claude Design Prompt: Tour Detail Page Variations

> **Goal:** Brainstorm 4–6 distinct design variations of the Discovery Details page (called `TourDetailPage` in code) for Nezasa's TripBuilder platform. Each variation should explore a different information hierarchy, layout philosophy, or UX strategy — while staying within our existing design system.

---

## Context

### What this page is

The Tour Detail page is the most important conversion point in our Discovery booking funnel. A traveller has already browsed available tours and clicked into one — now they need enough information and confidence to book. This page must balance rich content (itinerary, photos, inclusions, logistics) with a clear, low-friction path to booking.

### Who uses it

- **Travel agents** using the TripBuilder back-office to build itineraries for their customers
- **End travellers** browsing tours directly through a white-labelled front-end
- Both audiences need clarity, but agents need speed (they do this all day), while travellers need inspiration and trust signals

### Product context

This is for **Nezasa TripBuilder** — a B2B SaaS platform used by large tour operators (like TUI) to plan, book, and manage multi-day travel itineraries. The Discovery section is where travellers or agents browse and select tours before entering the Smart Planner to customise and book.

---

## Design System Constraints

Use these exactly — every variation must feel like it belongs in TripBuilder.

### Colors
| Token | Value | Usage |
|---|---|---|
| `--primary` | `#2681ff` | CTAs, links, active states |
| `--success` | `#19a974` | Included items, positive indicators |
| `--warning` | `#ffb700` | Alerts, urgency signals |
| `--destructive` | `#d4183d` | Errors, "excluded" items |
| `--foreground` | `oklch(0.145 0 0)` (near-black) | Body text |
| `--muted-foreground` | `#717182` | Secondary text |
| `--muted` | `#ececf0` | Page background |
| `--grey-lightest` | `#f3f5f6` | Section backgrounds |
| `--card` | `#ffffff` | Card backgrounds |
| `--border` | `rgba(0, 0, 0, 0.1)` | Borders and dividers |

### Typography
- **Font:** Mulish (Google Fonts)
- **Weights:** 400 (normal), 500 (medium), 600–700 (bold)
- **Base size:** 16px

### Component library
- **shadcn/ui** components (Button, Card, Tabs, Accordion, Dialog, Badge, etc.)
- **Lucide React** icons (15–20px typical)
- **Tailwind CSS v4** utility classes
- **Cards:** `bg-card rounded-xl shadow-sm border border-border`
- **Buttons:** Primary filled (`bg-primary text-primary-foreground`), secondary outlined, ghost/text

### Layout patterns
- **Desktop:** Two-column grid `lg:grid-cols-[1fr_380px]` (content + sticky sidebar)
- **Mobile:** Single column with sticky bottom footer (price + CTA)
- **Responsive breakpoints:** `sm:640px`, `md:768px`, `lg:1024px`
- **Max content width:** Content reads well up to ~1280px

---

## Data Model

Each tour provides these fields to work with:

```
Tour {
  title, subtitle, tripType ("group-tour" | "individual-tour")
  duration (days), startDate, endDate, adults
  locationsLabel        — "Lucerne · Interlaken · Brig · Chur"
  mainImage, gallery[]  — hero + additional photos
  highlights[]          — key selling points as strings
  attributes[]          — quick facts with icons (group size, language, activity level, min age)
  
  price {
    perPerson, total, currency
    paidBefore, paidAtDestination  — split payment info
  }
  
  days[] {               — day-by-day itinerary
    dayNumber, title, location?, image?
    items[] { type: "highlight"|"hotel"|"transport", label, description? }
  }
  
  stops[] {              — destination stops with coordinates
    destinationName, dateRange, nights, description
    accommodation { hotelName, stars, roomType, boardType, checkIn, checkOut }
    activities[] { date, name, description, image? }
    lat?, lng?
  }
  
  transfers[] {          — transport between stops
    from, to, date, mode, description?, image?
  }
  
  included[], excluded[] — what's in/not in the price
}
```

---

## Industry Research: What Top Tour Operators Do Well

I researched 13 major tour operators (TUI, G Adventures, Intrepid Travel, Contiki, Trafalgar, Exodus, Hurtigruten, Insight Vacations, Audley Travel, Kuoni, Kensington Tours, Scott Dunn, Abercrombie & Kent) to identify best practices. Here's what matters most:

### Information hierarchy (above the fold)
The strongest pages show **five things immediately**: a stunning hero image, the tour title, star rating / social proof, the price, and a primary CTA. Everything else lives below the fold in progressive-disclosure sections. Intrepid Travel and Trafalgar do this particularly well — a traveller knows within 3 seconds what the tour is, how much it costs, and whether other people liked it.

### Progressive disclosure
Day-by-day itineraries are universally presented as **accordions** — one day expanded at a time. Tabs work well for grouping secondary content (Overview, Inclusions, Reviews, FAQs). Hurtigruten and G Adventures both use this pattern cleanly. The key insight: don't force scrolling past critical info to reach the booking CTA.

### Sticky booking sidebar / mobile footer
Every high-performing operator keeps the price and CTA visible at all times. On desktop this is a **sticky right sidebar** (Trafalgar, Intrepid, Insight Vacations). On mobile it's a **sticky bottom bar** with condensed price + "Book Now" button. Some operators (Contiki) also show payment plan info ("from £99/month") right in this sticky element.

### Social proof placement
95% of travellers read reviews before booking. The best pages show an **aggregate rating near the top** (close to the price), then detailed reviews further down. Insight Vacations leads with "4.6/5 on 48,000+ reviews" — the volume itself is a trust signal.

### Multiple CTA placements
High-converting pages place CTAs in at least 3 positions: above the fold, after the itinerary section, and at the page bottom. They also offer a lower-friction alternative ("Request Info" or "Ask a Question") alongside the primary "Book Now" for visitors who aren't ready to commit.

### Visual storytelling
Maps, photo galleries, and video all play crucial roles. An **interactive route map** showing the journey from stop to stop builds excitement and understanding. Photo galleries need both professional hero shots and authentic detail images. G Adventures uses their "Chief Experience Officer" (local guide) prominently — personal faces build trust.

### Inclusions clarity
A clear "What's Included" checklist with green checkmarks is standard. The best operators (Trafalgar, Exodus) clearly separate what's included vs. excluded vs. optional add-ons, using distinct visual treatments for each.

### Trust & logistics signals
Group size, difficulty level, accessibility info, language, cancellation policy — these reduce anxiety. Hurtigruten stands out by showing physical difficulty with alternative activity options. Kensington Tours categorises by collection type (Ultraluxe, Heritage, Epicurean) which sets expectations.

### Payment flexibility
Showing instalment options on the detail page (not just at checkout) increases conversion. Contiki and EF Tours prominently display "Pay in 3 instalments" alongside the full price.

---

## What to Design

Create **4–6 visually distinct variations** of the Tour Detail page. Each should be a complete page design (not just a section). For each variation:

1. **Name it** with a short descriptor (e.g. "Immersive Storyteller", "Agent Speed View")
2. **State the core design thesis** — what's the one big bet this variation makes?
3. **Show the full page layout** — hero through footer, desktop and mobile
4. **Call out what's different** from the other variations

### Variation prompts to explore

**Variation A — "Visual Storyteller"**
Lead with full-bleed cinematic imagery. The hero takes up the entire viewport. Itinerary is presented as a visual timeline with destination photos flowing down the page. Optimised for the dreaming/inspiration phase. Think: luxury travel magazine meets booking page.

**Variation B — "Progressive Planner"**
Information-dense but organised through progressive disclosure. Compact hero, then a tabbed interface where each tab reveals a complete content section (Itinerary, Inclusions, Hotels, Map, Reviews). The sidebar booking widget is always visible. Optimised for agents who need to scan quickly.

**Variation C — "Map-Centric Journey"**
The interactive route map is the centrepiece, taking up a large portion of the viewport. Clicking on map stops reveals that stop's details in a side panel or overlay. The itinerary literally follows the geography. Ideal for multi-destination tours where the route IS the product.

**Variation D — "Social Proof First"**
Reviews and ratings are elevated above the itinerary. After the hero, the first section is a curated review mosaic with ratings, traveller photos, and testimonials. The thesis: trust drives conversion more than itinerary details. Works especially well for well-reviewed popular tours.

**Variation E — "Mobile-Native Scroll"**
Designed mobile-first and scaled up. Uses a single continuous scroll with full-width section cards, swipeable photo carousels, and a persistent bottom bar. On desktop, the content simply centres in a comfortable reading width with the sidebar. Prioritises touch-friendly interactions.

**Variation F — "Comparison-Ready"**
Designed for the traveller comparing 2–3 tours. Key metrics (price, duration, group size, difficulty, inclusions count) are presented in a scannable summary card at top. "Quick facts" table format. Easy to screenshot or share. The booking sidebar includes a "Compare" or "Save" action alongside "Book Now".

### For each variation, show:
- Hero / above-the-fold composition
- How the day-by-day itinerary is presented
- Where price, CTA, and social proof appear
- How inclusions/exclusions are displayed
- Map integration approach
- Mobile adaptation
- Any unique UI patterns or micro-interactions

---

## Existing Implementation Reference

We already have a working `TourDetailPage.tsx` in our codebase. The current version uses:
- A white card at top with back button, photo grid (1 hero + 2×2 thumbnails), title, duration, and location breadcrumb
- Two-column body: left column has info tabs (Overview/Highlights/Included/Excluded) + day-by-day accordion + route map; right column has a sticky booking widget with date picker, traveller count, and hotel preference
- Mobile sticky footer with price and CTA
- The booking widget has three expandable panels (date, travellers, hotel preference)

This is a solid foundation. The variations should explore whether we can do better — different hierarchies, different emphasis, different visual treatments — while staying within our design system.

---

## Output Format

For each variation, provide:
1. A descriptive name and one-sentence design thesis
2. Annotated wireframe or high-fidelity mockup showing the full page (desktop)
3. Mobile version of the same
4. A short paragraph explaining what makes this variation interesting and when it would work best
5. Any risks or trade-offs compared to the current design
