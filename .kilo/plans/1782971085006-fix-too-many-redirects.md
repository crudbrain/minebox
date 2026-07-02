# Fix: ERR_TOO_MANY_REDIRECTS en production

## Cause racine

Double vérification d'authentification contradictoire entre le proxy (Edge layer) et le layout ws (Server Component) :

1. **`proxy.ts`** (Edge layer) vérifie le cookie de session via `getSessionCookie()` et redirige vers `/login` si absent
2. **`app/ws/layout.tsx`** (Server Component) vérifie la session via `auth.api.getSession()` et redirige vers `/login` si absente

En production, quand `getSessionCookie()` ne reconnaît pas le cookie (nom de cookie différent, flag Secure/SameSite, ou incompatibilité proxy Edge), le proxy redirige vers `/login`. Mais si la session est valide côté serveur (cookie lu correctement par better-auth), `/login` redirige vers `/ws` → le proxy redirige à nouveau vers `/login` → **boucle infinie**.

## Solution

Supprimer la vérification d'authentification du `proxy.ts`. Le layout `ws` fait déjà une vérification complète et sécurisée via `auth.api.getSession()`.

## Étapes

### 1. Modifier `proxy.ts` — supprimer la vérification de session

Remplacer le contenu par un simple pass-through :

```ts
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/ws/:path*"],
};
```

### 2. Vérifier `BETTER_AUTH_URL` en production

Dans `.env`, `BETTER_AUTH_URL=http://localhost:3000`. En production sur `www.ndungo.app`, cette variable doit être `https://www.ndungo.app`. Si elle n'est pas surchargée dans l'environnement de déploiement, les cookies de session ne seront pas valides.

**Action** : S'assurer que `BETTER_AUTH_URL=https://www.ndungo.app` est défini dans les variables d'environnement de production (Vercel/plateforme de déploiement).

### 3. Vérifier que l'authentification reste sécurisée

Les protections existantes après suppression du proxy :
- **Pages ws** : `app/ws/layout.tsx:21-25` vérifie `auth.api.getSession()` et redirige vers `/login`
- **Pages settings** : `app/ws/settings/layout.tsx:12-16` vérifie session + rôle admin
- **API routes** : Chaque route API vérifie `auth.api.getSession()` et renvoie 401 si non autorisé
- **Route racine** : `app/page.tsx` redirige vers `/login`
- **Login** : `app/login/page.tsx` redirige les utilisateurs authentifiés vers `/ws`
- **Setup** : `app/setup/page.tsx` redirige vers `/login` si company existe déjà

Aucune vulnérabilité n'est introduite : toutes les vérifications côté serveur restent intactes.

## Risques

- **Aucun** : Le proxy était une couche redondante qui causait le bug. Toute la sécurité repose déjà sur les Server Components et les API routes.
