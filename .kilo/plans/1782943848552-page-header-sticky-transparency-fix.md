# Fix PageHeader Sticky Transparency

## Problem
When `PageHeader` is sticky and the user scrolls, the content behind it shows through (transparency). The `bg-layout` Tailwind class does not reliably override Ant Design CSS-in-JS `background` shorthand on `.ant-layout`, causing the header background to be missing/transparent.

## Root Cause
Ant Design v6 injects `background: colorBgLayout` via CSS-in-JS on `.ant-layout` (shorthand property). Tailwind's `bg-layout` generates `background-color: var(--color-bg-layout)` (longhand). The CSS-in-JS styles can win specificity, or the `background` shorthand on a parent context interferes with child `background-color`. Additionally, `z-10` may be insufficient.

## Fix
**File:** `components/shared/page-header.tsx` — line 15

Change the className from:
```
sticky top-0 z-10 bg-layout flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3
```
to:
```
sticky top-0 z-40 !bg-layout border-b border-border-secondary flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3
```

Three changes:
1. `bg-layout` → `!bg-layout` — forces `background-color` with `!important` to win against Ant Design CSS-in-JS
2. `z-10` → `z-40` — higher z-index to ensure stacking above scrolling content
3. Add `border-b border-border-secondary` — visual boundary when content scrolls under the header

## Validation
- Scroll any page using `PageHeader` (settings, bank-accounts, partners, users)
- Confirm header is opaque (no content visible through it)
- Confirm header has a subtle bottom border visible on scroll
- Confirm header stays fixed at top during scroll
