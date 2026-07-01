# Plan: Dashboard Cards → Navigation Links

## Context
The dashboard page (`app/ws/(dashboard)/page.tsx`) displays two card groups ("Comptes" and "Partenaires") as static `Card` components with `Statistic` values. Clicking these cards currently does nothing.

## Goal
Make each top-level card group navigate to its corresponding list page when clicked:
- "Comptes" card → `/ws/bank-accounts`
- "Partenaires" card → `/ws/partners`

## Implementation

### Step 1: Wrap card groups with `Link` in `app/ws/(dashboard)/page.tsx`

- Import `Link` from `next/link`
- Wrap the "Comptes" outer `Card` (line 17) with `<Link href="/ws/bank-accounts">`
- Wrap the "Partenaires" outer `Card` (line 51) with `<Link href="/ws/partners">`
- Add `cursor: pointer` style or hover effect to indicate clickability (optional, Ant Design `Card` with `hoverable` prop works well)

### Step 2: Add `hoverable` to clickable cards

- Add `hoverable` prop to both outer `Card` components to provide visual feedback that they are clickable

## Files Modified
- `app/ws/(dashboard)/page.tsx`

## Validation
- Click the "Comptes" card → navigates to `/ws/bank-accounts`
- Click the "Partenaires" card → navigates to `/ws/partners`
- Cards show hover effect (shadow/elevation change) indicating clickability
