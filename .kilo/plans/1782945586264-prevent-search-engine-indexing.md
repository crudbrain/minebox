# Plan : Empêcher l'indexation par les moteurs de recherche

## Contexte
Application Minebox (Next.js App Router) — application privée de gestion de comptes et partenaires. Aucun `robots.txt`, aucune meta robots, aucun header `X-Robots-Tag` n'existe actuellement.

## Objectif
Empêcher tout moteur de recherche d'indexer l'application, en utilisant les 3 couches de protection conformes aux conventions Next.js.

## Modifications

### 1. Créer `app/robots.ts` — Fichier convention Next.js
Génère un `robots.txt` dynamique via la convention fichier Next.js (`MetadataRoute.Robots`).

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
```

Output attendu : `User-Agent: *` + `Disallow: /` — aucun sitemap, aucune page autorisée.

### 2. Modifier `app/layout.tsx` — Ajouter `robots` metadata
Ajouter la propriété `robots` à l'objet `metadata` existant dans le root layout pour injecter `<meta name="robots" content="noindex, nofollow">` et `<meta name="googlebot" content="noindex, nofollow">` dans le `<head>`.

```ts
export const metadata: Metadata = {
  title: "Minebox",
  description: "Gestion de comptes et partenaires",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
```

### 3. Modifier `next.config.ts` — Ajouter header HTTP `X-Robots-Tag`
Ajouter un header `X-Robots-Tag: noindex, nofollow` sur toutes les routes via la config `headers` de Next.js.

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
};
```

## Validation
- `GET /robots.txt` doit retourner `User-Agent: *` + `Disallow: /`
- Le `<head>` de n'importe quelle page doit contenir `<meta name="robots" content="noindex, nofollow">` et `<meta name="googlebot" content="noindex, nofollow">`
- Les headers HTTP de n'importe quelle réponse doivent contenir `X-Robots-Tag: noindex, nofollow`
- Lancer `npm run build` (ou `npm run lint`) pour vérifier l'absence d'erreurs
