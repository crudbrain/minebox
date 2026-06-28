# Fix Prisma Migrate Dev: Missing datasource.url

## Problem
Running `npx prisma migrate dev` fails with:
```
Error: The datasource.url property is required in your Prisma config file when using prisma migrate dev.
```

`prisma.config.ts` references `process.env.DATABASE_URL`, but `.env` is not loaded automatically in the Prisma config TS context, so the value is `undefined` at runtime.

## Fix
Add `dotenv.config()` import and call at the top of `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Validation
Run `npx prisma migrate dev` and confirm it no longer throws the datasource.url error.
