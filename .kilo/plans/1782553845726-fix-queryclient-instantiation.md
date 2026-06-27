# Plan: Fix QueryClient instantiation in providers.tsx

## Context
- `components/providers.tsx` currently uses `useState(() => new QueryClient())` inside the `Providers` component
- User prefers declaring `const queryClient = new QueryClient()` outside the component as a module-level singleton

## Steps

### 1. Edit `components/providers.tsx`
- Remove `useState` import from `react`
- Move `const queryClient = new QueryClient()` outside the `Providers` function (module-level)
- Remove the `const [queryClient] = useState(...)` line inside the function

Current:
```tsx
import { useState } from 'react';
// ...
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
```

Target:
```tsx
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
```

### 2. Validate
- Run `npm run build` to confirm no type/build errors
