# DesignLint Quick Rules Reference

Fast-lookup table for the most common violations. Use this alongside DESIGN_SYSTEM.md for full context.

## Color Tokens (never hardcode)

| Wrong | Correct |
|-------|---------|
| `text-[#333743]` | `text-foreground` |
| `text-[#ffffff]` | `text-primary-foreground` or `text-white` |
| `bg-[#2681ff]` | `bg-primary` |
| `bg-[#f3f5f6]` | `bg-background` |
| `bg-[#ffffff]` | `bg-card` or `bg-white` |
| `border-[#e0e2e8]` | `border-border` |
| `text-[#ff4136]` | `text-destructive` or `text-danger` |
| `text-[#19a974]` | `text-success` |
| `text-[#ffb700]` | `text-warning` |
| `text-[#9598a4]` | `text-grey` or `text-muted-foreground` |
| `bg-[#e0e2e8]` | `bg-grey-light` |
| `text-gray-500` | `text-muted-foreground` or `text-grey` |
| `rgb(...)` or `rgba(...)` in className | Use Tailwind token with opacity: `bg-primary/50` |

## Typography Canonical Patterns

| Context | Required Classes |
|---------|-----------------|
| Dialog title | `text-xl leading-none font-extrabold` |
| Drawer header (desktop) | `text-3xl font-bold` |
| Drawer header (mobile) | `text-xl font-bold` |
| Card title | `leading-none font-semibold` |
| Card description | `text-muted-foreground text-xs` |
| Field label | `text-sm leading-snug font-medium` |
| Field description | `text-sm leading-normal font-normal text-muted-foreground` |
| Error message | `text-sm font-normal text-destructive` |
| Button text | `text-xs font-medium` (inherited from Button component) |
| Badge text | `text-xs font-medium` (inherited from Badge component) |

## Border Radius by Element

| Element | Class |
|---------|-------|
| Buttons | `rounded-md` |
| Inputs | `rounded-lg` |
| Cards | `rounded-xl` |
| Badges | `rounded-md` |
| Dialogs (mobile) | `rounded-t-3xl` |
| Dialogs (desktop) | `rounded-3xl` |
| Icon buttons | `rounded-full` |

## Button Variant Decision Tree

```
Is this the main action on screen? → primary
Is it a supporting/secondary action? → secondary
Is it low-emphasis / less important? → tertiary
Does it delete/remove something? → destructive
Is it sitting on top of an image / hero overlay? → inverted
Is it just text with no emphasis? → text
Is it a navigation link? → link
Is it contextual / appears on hover? → ghost
```

## Icon Status Colors

| Status | Icon | Class |
|--------|------|-------|
| Success | `CircleCheck` | `stroke-success` |
| Error | `CircleX` | `stroke-danger` |
| Warning | `TriangleAlert` | `stroke-warning` |
| Info | `Info` | `stroke-info` |

## Common a11y Violations

| Pattern | Fix |
|---------|-----|
| `<div onClick={...}>` | Use `<button>` |
| Icon button without label | Add `aria-label="description"` |
| Decorative icon without hiding | Add `aria-hidden="true"` |
| `data-testid="..."` | Replace with `data-feature-id="..."` |
| `outline-none` without focus ring | Add `focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| `<img>` without alt | Add `alt="description"` or `alt=""` if decorative |

## i18n Key Format

```
module.context.purpose.name

Examples:
  smartplanner.accommodation.error.selectionFailed
  groundTransports.searchForm.error.departure.required
  hotelSearch.filters.starsLabel
```

## CTA Wording Conventions

| Action | Pattern | Example |
|--------|---------|---------|
| Selection | Choose [item] | Choose activity |
| Addition | Add [item] | Add flight |
| Editing | Change [item] | Change hotel |
| Removal | Remove [item] | Remove flight |
| Browse | Go to all [items] | Go to all hotels |
| Load more | Load more [items] | Load more activities |
| Back | Back to [location] | Back to Planner |

## Animation Durations

| Context | Duration |
|---------|----------|
| Overlays (dialog, popover, tooltip) | 200ms |
| Drawer slide | 300ms, ease-in-out |
| Framer Motion collapsible | 0.2s |
| Toast auto-close | 5000ms |

## Forbidden Patterns (also caught by pre-push hooks)

- `data-testid` in source files → use `data-feature-id`
- `@ts-ignore` or `@ts-expect-error`
- `as any` type assertions
- Explicit `any` type annotations
- `biome-ignore` for complexity/correctness/suspicious/a11y/performance/style
- `dangerouslySetInnerHTML` without DOMPurify
- Direct `fetch()` in components
- Direct `localStorage`/`sessionStorage` in components
- Literal query key arrays (use `queryKeys.*`)
- `Math.random()`, `Date.now()`, `new Date()`, `crypto.randomUUID()` in render

---

## Discovery App (apps/discovery/) — Additional Rules

> All rules above apply to Discovery too. These are Next.js 15 / App Router specific additions.

### Server vs Client Component Decision

| Add `'use client'` | Keep as Server Component (default) |
|--------------------|------------------------------------|
| `onClick`, `onChange`, other event handlers | Fetching data (`async/await`) |
| `useState`, `useEffect`, `useRef` hooks | Accessing env variables |
| `useRouter`, `usePathname`, `useSearchParams` | Layout, page, not-found, loading files |
| Browser APIs (`localStorage`, `window`) | Static/revalidated content |
| Framer Motion animations | Anything with no user interaction |

### Next.js 15 Forbidden Patterns

| Pattern | Fix |
|---------|-----|
| `import { useRouter } from 'next/router'` | Use `next/navigation` |
| `<a href="/internal">` | Use `<Link href="/internal">` |
| `async` Client Component | Move data fetching to Server Component parent |
| `'use client'` on `layout.tsx` | Extract interactive child, keep layout as server |
| `params.id` without await | `const { id } = await params` |
| `redirect()` inside try/catch | Move `redirect()` outside try/catch |
| `<img src="...">` for content images | Use `<Image>` from `next/image` |
| `@import url("fonts.googleapis.com/...")` | Use `next/font/google` |
| Direct external API call in Client Component | Proxy via Route Handler or fetch in Server Component |

### Next.js Navigation Quick Ref

| Need | Import |
|------|--------|
| Programmatic navigation | `useRouter` from `next/navigation` |
| Internal links | `Link` from `next/link` |
| Server-side redirect | `redirect` from `next/navigation` |
| Trigger 404 | `notFound` from `next/navigation` |
| Current path (client) | `usePathname` from `next/navigation` |
| Search params (client) | `useSearchParams` from `next/navigation` (wrap page in `<Suspense>`) |

### Font Loading (Discovery only)

```tsx
// ✅ Correct — next/font/google in layout.tsx
import { Mulish } from 'next/font/google';
const mulish = Mulish({ subsets: ['latin'], variable: '--font-mulish' });

// ❌ Wrong — CSS @import or <link> tag
@import url("https://fonts.googleapis.com/css2?family=Mulish...");
```

### Async Params Pattern (Next.js 15)

```tsx
// ✅ Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// ❌ Wrong (Next.js 14 style, deprecated)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}
```
