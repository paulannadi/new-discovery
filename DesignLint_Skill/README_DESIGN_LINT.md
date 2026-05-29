# DesignLint Skill — Setup Instructions

This ZIP contains the DesignLint Claude Code skill for the SmartPlanner and Discovery frontend.

## What's inside

| File | Destination in repo |
|------|-------------------|
| DESIGN_SYSTEM.md | repo root |
| SKILL.md | .claude/skills/design-lint/SKILL.md |
| quick-rules.md | .claude/skills/design-lint/references/quick-rules.md |

## How to install

1. Copy DESIGN_SYSTEM.md to the repo root (replace if it exists)
2. Create the folder .claude/skills/design-lint/references/ if it doesn't exist
3. Copy SKILL.md to .claude/skills/design-lint/SKILL.md
4. Copy quick-rules.md to .claude/skills/design-lint/references/quick-rules.md
5. Commit all three files

## How to use

In Claude Code (VS Code), type any of:
  "design lint"
  "check my UI"
  "review my styles"
  "check design consistency"
  "lint my components"
  "are my changes consistent"

DesignLint will automatically find your changed files via git diff and walk
you through each issue with a proposed fix.

## What's covered

- SmartPlanner (src/) — colors, typography, icons, spacing, components,
  accessibility, animation, forms, terminology, forbidden patterns
- Discovery app (apps/discovery/) — all of the above plus Next.js 15 /
  App Router specific rules (server vs client boundaries, async params,
  next/image, next/font, navigation imports, etc.)

## Version

Updated April 2026 — includes:
- Appendix D: Discovery / Next.js 15 rules
- Appendix E: Code architecture patterns (naming, module anatomy,
  state management, canonical API pattern, dependency policy)
- How-to-prompt guidance at the top of DESIGN_SYSTEM.md
