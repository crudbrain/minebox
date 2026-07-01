# Plan: Install & Configure nextjs-toploader

## Context
- **Primary color**: `#8A9A86` (defined in `components/providers.tsx:17` as `colorPrimary`)
- **Root layout**: `app/layout.tsx` (App Router)
- **Providers wrapper**: `components/providers.tsx` (client component wrapping AntdRegistry, QueryClient, etc.)
- **Next.js version**: 16.2.9 (App Router)

## Tasks

1. **Install the package**
   ```bash
   npm i nextjs-toploader
   ```

2. **Add `<NextTopLoader />` to `app/layout.tsx`**
   - Import: `import NextTopLoader from 'nextjs-toploader';`
   - Place it inside `<body>`, before `<Providers>`:
     ```tsx
     <body className="min-h-full flex flex-col">
       <NextTopLoader color="#8A9A86" height={3} showSpinner={false} />
       <Providers>{children}</Providers>
     </body>
     ```
   - Props rationale:
     - `color="#8A9A86"` — matches the Ant Design primary color
     - `height={3}` — keeps the default slim bar
     - `showSpinner={false}` — the top bar alone provides sufficient feedback; spinner adds visual noise

3. **No other changes needed** — nextjs-toploader automatically detects App Router navigation events. No `useRouter` override is required unless client-side `router.push` calls should also trigger the bar; those can be migrated later by importing `useRouter` from `nextjs-toploader/app` instead of `next/navigation`.

## Validation
- Run `npm run build` to verify no type/build errors
- Navigate between pages in dev (`npm run dev`) to confirm the top loader bar appears with the green-sage color
