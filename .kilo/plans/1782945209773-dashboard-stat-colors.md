# Plan: Dashboard — Couleurs distinctes par valeur StatTile

## Contexte
Le dashboard (`app/ws/(dashboard)/page.tsx`) affiche 5 `StatTile` avec la même apparence (`text-foreground`). L'objectif est d'attribuer une couleur unique à chaque valeur pour les faire ressortir visuellement, en harmonie avec le thème mute/organique existant.

## Palette (harmonisée avec le thème sage/beige)

| Valeur | CSS Variable | Couleur | Usage |
|---|---|---|---|
| Clients (compte) | `--stat-blue` | `#6B7F99` | Icône + valeur |
| Banque (montant +) | `--stat-green` | `#6B9E7A` | Icône + valeur |
| Crédits (montant -) | `--stat-amber` | `#C49A3C` | Icône + valeur |
| Partenaires (compte) | `--stat-lavender` | `#8B7FA8` | Icône + valeur |
| Crédits Partenaires | `--stat-rose` | `#B07A8A` | Icône + valeur |

## Taches

1. **`app/globals.css`** — Ajouter 5 custom properties dans `:root` et les mapper dans `@theme inline` :
   - `:root`: `--stat-blue: #6B7F99`, `--stat-green: #6B9E7A`, `--stat-amber: #C49A3C`, `--stat-lavender: #8B7FA8`, `--stat-rose: #B07A8A`
   - `@theme inline`: `--color-stat-blue`, `--color-stat-green`, `--color-stat-amber`, `--color-stat-lavender`, `--color-stat-rose`

2. **`app/ws/(dashboard)/page.tsx`** — Étendre `StatTile` :
   - Ajouter prop `colorClass: string` a `StatTileProps`
   - Appliquer `colorClass` sur l'icône (remplacer `text-primary`) et sur la valeur (remplacer `text-foreground`)
   - Passer la classe couleur correspondante a chaque `StatTile` :
     - Clients → `text-stat-blue`
     - Banque → `text-stat-green`
     - Crédits → `text-stat-amber`
     - Partenaires → `text-stat-lavender`
     - Crédits Partenaires → `text-stat-rose`

## Validation
- Verifier visuellement que les 5 tuiles affichent des couleurs distinctes
- Confirmer que les couleurs s'harmonisent avec le theme existant (pas de contraste excessif)
- Verifier que le label reste en `text-foreground/60` (inchangé, lisibilite preservee)
