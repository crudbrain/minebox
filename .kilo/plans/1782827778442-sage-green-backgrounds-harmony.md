# Plan: Harmonisation Vert Sauge — Backgrounds Antd + Tailwind

## Contexte
- antd v6.4.5 dérive automatiquement `colorBgLayout`, `colorBgContainer`, `colorBgElevated`, `colorBorder`, `colorBorderSecondary` etc. à partir de `colorBgBase`. **Mais l'algorithme par défaut produit des gris neutre, pas des valeurs tintées vert sauge**.
- L'implémentation actuelle dans `components/providers.tsx` a les seed tokens vert sauge mais **n'override pas les tokens dérivés** → les backgrounds antd restent gris.
- 6 composants utilisent des classes Tailwind hardcodées (`bg-gray-50`, `bg-white`, `border-gray-200`) qui sont gris pur et ne suivront jamais le thème antd.
- `globals.css` a `--background: #ffffff` et `--foreground: #171717`, non alignés sur la palette.

## Palette vert sauge — Tokens dérivés à override

Ces valeurs sont calculées pour être en harmonie avec `colorPrimary: #8A9A86` et `colorBgBase: #FAFAF8` :

| Token | Hex | Rôle |
|---|---|---|
| `colorBgBase` | `#FAFAF8` | Blanc cassé chaud — fond de base (déjà en place) |
| `colorBgLayout` | `#EDECE7` | Vert sauge très pâle — backgrounds de page/layout |
| `colorBgContainer` | `#F7F6F2` | Vert sauge subtil — cards, containers, inputs |
| `colorBgElevated` | `#FFFFFF` | Blanc pur — modals, popups, drawers |
| `colorBorder` | `#D5D3CD` | Gris vert sauge — bordures principales |
| `colorBorderSecondary` | `#E6E4DE` | Gris vert sauge pâle — bordures secondaires, séparateurs |
| `colorFill` | `#8A9A8615` | ~5% opacity primary — fills hover/active |
| `colorFillSecondary` | `#8A9A8608` | ~3% opacity primary — fills subtiles |
| `colorFillTertiary` | `#8A9A8604` | ~2% opacity primary — fills très subtiles |

## Changements

### 1. `components/providers.tsx` — Override tokens dérivés antd

Ajouter les tokens dérivés dans l'objet `theme.token` :

```tsx
const theme = {
  token: {
    colorPrimary: '#8A9A86',
    colorSuccess: '#7A9A6A',
    colorWarning: '#C4A862',
    colorError: '#C46B6B',
    colorInfo: '#7A8FA5',
    colorBgBase: '#FAFAF8',
    colorBgLayout: '#EDECE7',
    colorBgContainer: '#F7F6F2',
    colorBgElevated: '#FFFFFF',
    colorTextBase: '#2D3430',
    colorBorder: '#D5D3CD',
    colorBorderSecondary: '#E6E4DE',
    colorFill: '#8A9A8615',
    colorFillSecondary: '#8A9A8608',
    colorFillTertiary: '#8A9A8604',
    colorLink: '#6B8A6A',
    colorLinkHover: '#5A7A5A',
    borderRadius: 6,
  },
};
```

### 2. `app/globals.css` — Ajouter CSS vars alignées + Tailwind custom colors

```css
@import "tailwindcss";

:root {
  --background: #FAFAF8;
  --foreground: #2D3430;
  --bg-layout: #EDECE7;
  --bg-container: #F7F6F2;
  --bg-elevated: #FFFFFF;
  --border-primary: #D5D3CD;
  --border-secondary: #E6E4DE;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-bg-layout: var(--bg-layout);
  --color-bg-container: var(--bg-container);
  --color-bg-elevated: var(--bg-elevated);
  --color-border-primary: var(--border-primary);
  --color-border-secondary: var(--border-secondary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

Note: Le bloc `@media (prefers-color-scheme: dark)` est supprimé — l'app n'a pas de mode dark actuellement et les valeurs hardcodées dark ne sont pas harmonisées avec la palette vert sauge.

### 3. Remplacer les classes Tailwind hardcodées dans 6 composants

| Fichier | Ancienne classe | Nouvelle classe |
|---|---|---|
| `components/ws/workspace-shell.tsx:30` | `bg-white border-b border-gray-200` | `bg-container border-b border-border-secondary` |
| `components/ws/workspace-shell.tsx:42` | `bg-gray-50` | `bg-layout` |
| `components/ws/sidebar.tsx:85` | `border-b border-gray-200` | `border-b border-border-secondary` |
| `components/ws/sidebar.tsx:121` | `border-t border-gray-200` | `border-t border-border-secondary` |
| `components/login/login-form.tsx:37` | `bg-gray-100` | `bg-layout` |
| `components/setup/setup-form.tsx:53` | `bg-gray-100` | `bg-layout` |

### 4. Ne pas modifier (hors scope)

- **Print/export sections** (`background: "#fff"` dans partner-transfers.tsx, bank-account-transactions.tsx, transaction-detail-drawer.tsx) — le blanc reste correct pour les exports JPG/print.
- **Danger zone cards** (`backgroundColor: '#fff2f0'`, `borderColor: '#ffccc7'`) — ces couleurs error restent dans la palette antd error, ce n'est pas vert sauge.
- **`bg-white` dans transfer-detail-drawer.tsx:85** et **transaction-detail-drawer.tsx:186** — ces `bg-white` sont sur des refs pour export print, pas des backgrounds visuels principaux. Cependant, si ce sont des divs visibles à l'utilisateur, ils doivent passer à `bg-container`. À vérifier à l'implémentation.

## Validation
1. `npm run build` — vérifier aucune erreur de compilation
2. Vérifier visuellement : workspace shell background, sidebar borders, login/setup page backgrounds
3. Vérifier que les composants antd (cards, modals, inputs, tables) ont des backgrounds tintés vert sauge et non gris neutre
