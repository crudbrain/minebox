# Plan: Install Antd + TanStack Query & Configure Providers

## Context
- Project: Next.js 16.2.9 / React 19.2.4 / Tailwind v4
- `antd`, `@ant-design/icons@6.x`, `@ant-design/nextjs-registry` are **already installed** in package.json
- `@tanstack/react-query` is **not yet installed**
- `app/layout.tsx` has NOT been modified yet — AntdRegistry is missing
- No `components/` directory exists yet

## Steps

### 1. Edit `app/layout.tsx` — Add AntdRegistry
- Add import: `import { AntdRegistry } from '@ant-design/nextjs-registry';`
- Change `<body>` content from:
  ```tsx
  <body className="min-h-full flex flex-col">{children}</body>
  ```
  to:
  ```tsx
  <body className="min-h-full flex flex-col">
    <AntdRegistry>{children}</AntdRegistry>
  </body>
  ```

### 2. Install `@tanstack/react-query`
```bash
npm install @tanstack/react-query
```

### 3. Create `components/providers.tsx`
- Must be a `'use client'` component
- Instantiate `QueryClient` with default options (no custom staleTime/retry)
- Combine `AntdRegistry` and `QueryClientProvider` in a single `<Providers>` component
- Structure:
  ```tsx
  'use client';

  import { AntdRegistry } from '@ant-design/nextjs-registry';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { useState } from 'react';

  export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
      <QueryClientProvider client={queryClient}>
        <AntdRegistry>{children}</AntdRegistry>
      </QueryClientProvider>
    );
  }
  ```

### 4. Edit `app/layout.tsx` — Use Providers component
- Remove the direct `AntdRegistry` import added in step 1
- Add import: `import { Providers } from '@/components/providers';`
- Change `<body>` content from:
  ```tsx
  <body className="min-h-full flex flex-col">
    <AntdRegistry>{children}</AntdRegistry>
  </body>
  ```
  to:
  ```tsx
  <body className="min-h-full flex flex-col">
    <Providers>{children}</Providers>
  </body>
  ```

### 5. Validate
- Run `npm run build` to verify no type/build errors
- Confirm `@ant-design/nextjs-registry` is compatible with Next.js 16

## Risks
- `@ant-design/nextjs-registry@1.3.0` has not been officially tested with Next.js 16 — build validation will confirm compatibility
- Potential CSS specificity conflicts between Ant Design and Tailwind v4 — monitor during development
