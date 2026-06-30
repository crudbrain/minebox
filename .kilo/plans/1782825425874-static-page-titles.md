# Static Page Titles for /login and /setup

## Context
- Root layout (`app/layout.tsx`) sets `title: "Minebox"` — child route metadata overrides this.
- `/ws` layout already has dynamic `generateMetadata` using company `shortName`/`name`.
- `/login` and `/setup` pages currently have no metadata exports, so they inherit "Minebox".

## Changes

### 1. `app/login/page.tsx`
- Add `import type { Metadata } from "next";`
- Add `export const metadata: Metadata = { title: "Connexion" };`

### 2. `app/setup/page.tsx`
- Add `import type { Metadata } from "next";`
- Add `export const metadata: Metadata = { title: "Configuration" };`

## Validation
- Navigate to `/login` — browser tab should show "Connexion"
- Navigate to `/setup` — browser tab should show "Configuration"
- Other pages should still show "Minebox" (root) or dynamic company name (`/ws/*`)
