# Plan: Configuration de better-auth + Prisma 7 + Neon PostgreSQL dans Next.js 16

## Contexte

- Projet Next.js 16.2.9 (App Router) vierge, sans Prisma ni auth existant
- Pas de `.env`, pas de `prisma/`, pas de `lib/`
- Objectif : configurer better-auth avec Prisma 7 (v7.8.0) + adapter Neon PostgreSQL

## Décisions

- **DB**: Neon PostgreSQL avec `@prisma/adapter-neon` (driver adapter obligatoire en Prisma 7)
- **Auth**: Email/password uniquement (social providers pourront être ajoutés plus tard)
- **Middleware**: Next.js 16 proxy.ts avec vérification cookie (`getSessionCookie`)
- **Prisma 7**: `output` obligatoire dans generator, `url` retiré du datasource (déplacé dans `prisma.config.ts`)
- **Pas de `dotenv`** : `.env.local` pour Next.js runtime, `.env` minimal pour Prisma CLI (chargé nativement)
- **Pas de `ws`** : Utiliser le mode HTTP fetch de Neon (`neonConfig.poolQueryViaFetch = true`)
- **Schéma Prisma** : Généré par `npx auth@latest generate` (pas écrit manuellement)
- **Migrations** : `npx prisma migrate dev` (pas `db push` — garder la trace des évolutions)

## Étapes d'implémentation

### 1. Installer les dépendances

```bash
npm install better-auth @better-auth/prisma-adapter
npm install prisma@7 @prisma/client@7 @prisma/adapter-neon@7
```

Pas de `dotenv`, pas de `ws`, pas de `@neondatabase/serverless` (inclu comme peer dep de l'adapter).

### 2. Créer `.env.local` (variables Next.js runtime)

```
BETTER_AUTH_SECRET=<générer avec openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@endpoint.region.aws.neon.tech/dbname?sslmode=require
```

Next.js charge automatiquement `.env.local`. `DATABASE_URL` = connexion poolée (app runtime). `DIRECT_URL` = connexion directe (Prisma CLI).

### 3. Créer `.env` (minimal, pour Prisma CLI uniquement)

```
DATABASE_URL=postgresql://user:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@endpoint.region.aws.neon.tech/dbname?sslmode=require
```

Prisma CLI charge nativement `.env` sans `dotenv`. Ce fichier contient uniquement les URLs DB. Ne pas y mettre `BETTER_AUTH_SECRET` (ce n'est pas nécessaire pour le CLI).

### 4. Créer `lib/prisma.ts`

```typescript
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```

Mode HTTP fetch (pas de WebSocket, pas de `ws`). `@neondatabase/serverless` est accessible car c'est un peer dependency de `@prisma/adapter-neon`.

### 5. Créer `lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
  ],
});
```

`nextCookies()` doit être le **dernier** plugin. Cette config doit exister avant de lancer `npx auth@latest generate`.

### 6. Créer `lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

### 7. Créer `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 8. Créer `prisma.config.ts` (racine du projet)

```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

Pas de `import "dotenv/config"` — Prisma CLI charge `.env` nativement.

### 9. Générer le schéma Prisma avec better-auth CLI

```bash
npx auth@latest generate
```

Cette commande lit `lib/auth.ts` et génère automatiquement `prisma/schema.prisma` avec les models nécessaires (User, Session, Account, Verification + relations pour les joins). Le schéma contiendra le `output` et le `datasource` adaptés à la config.

### 10. Générer le client Prisma et créer la migration initiale

```bash
npx prisma generate
npx prisma migrate dev --name init
```

- `prisma generate` : génère le client dans `generated/prisma/` (selon `output` du schema)
- `prisma migrate dev --name init` : crée la migration initiale + l'applique + garde la trace dans `prisma/migrations/`
- **Ne pas utiliser `prisma db push`** — on veut conserver l'historique des migrations

### 11. Créer `proxy.ts` (racine du projet)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
```

Vérification cookie uniquement (optimiste). La validation complète doit être faite dans chaque page/route protégée via `auth.api.getSession()`.

### 12. Mettre à jour `.gitignore`

Ajouter :
```
/generated/prisma/
```

### 13. Ajouter script `postinstall` dans `package.json`

```json
"postinstall": "prisma generate"
```

## Fichiers créés/modifiés - Résumé

| Fichier | Action |
|---------|--------|
| `.env.local` | Créer (variables Next.js runtime + auth) |
| `.env` | Créer (minimal, URLs DB uniquement pour Prisma CLI) |
| `.gitignore` | Modifier (ajouter `/generated/prisma/`) |
| `prisma/schema.prisma` | Généré par `npx auth@latest generate` |
| `prisma.config.ts` | Créer |
| `lib/prisma.ts` | Créer |
| `lib/auth.ts` | Créer |
| `lib/auth-client.ts` | Créer |
| `app/api/auth/[...all]/route.ts` | Créer |
| `proxy.ts` | Créer |
| `package.json` | Modifier (dépendances + postinstall) |

## Ordre d'exécution important

1. `npm install` (dépendances)
2. Créer `.env.local` + `.env`
3. Créer `lib/prisma.ts`
4. Créer `lib/auth.ts` (le CLI better-auth a besoin de lire cette config)
5. Créer `app/api/auth/[...all]/route.ts`
6. Créer `prisma.config.ts`
7. `npx auth@latest generate` (génère `prisma/schema.prisma`)
8. `npx prisma generate`
9. `npx prisma migrate dev --name init`
10. Créer `lib/auth-client.ts`
11. Créer `proxy.ts`
12. Mettre à jour `.gitignore` + `package.json`

## Risques / Points d'attention

- Prisma 7 impose `output` dans le generator et `prisma.config.ts` pour le datasource URL — ne pas mettre `url` dans `schema.prisma`
- Le proxy.ts utilise `getSessionCookie` (check cookie uniquement) — ce n'est PAS sécurisé seul ; valider la session côté serveur dans chaque page protégée
- `nextCookies()` doit être le dernier plugin dans le tableau `plugins` de better-auth
- `npx auth@latest generate` nécessite que `lib/auth.ts` existe et soit valide pour lire la config
- Mode HTTP fetch Neon (`poolQueryViaFetch = true`) : pas besoin de `ws`, mais légèrement plus lent que WebSocket pour les connexions longue durée
- `.env` (pour Prisma CLI) et `.env.local` (pour Next.js) contiennent les mêmes URLs DB — penser à les synchroniser

## Validation

1. `npm run build` doit passer sans erreur
2. `npx auth@latest generate` doit générer `prisma/schema.prisma`
3. `npx prisma generate` doit générer le client dans `generated/prisma/`
4. `npx prisma migrate dev --name init` doit créer la migration et les tables dans Neon
5. L'endpoint `/api/auth/get-session` doit répondre 200 (avec `{ session: null }`)
6. Le proxy doit rediriger les utilisateurs non authentifiés vers `/` pour `/dashboard`
