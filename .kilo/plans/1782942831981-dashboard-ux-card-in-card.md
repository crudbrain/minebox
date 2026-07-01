# Dashboard UX — Suppression du card-in-card

## Problème
Le dashboard actuel (`app/ws/(dashboard)/page.tsx`) imbrique des `<Card>` Ant Design (card-in-card), créant:
- Double bordure, double padding, surcharge visuelle
- Rendu "lourd" incompatible avec le theme minimal sage-green/beige

## Solution: Sections avec tuiles plates

### Fichier modifié
- `app/ws/(dashboard)/page.tsx` — réécriture complète du composant

### Supprimer
- Import et usage de `Card`, `Divider` depuis `antd`
- Toute `<Card>` imbriquée

### Nouvelle structure

```
<div>
  <h1>Dashboard</h1>

  <!-- Section Comptes -->
  <section>
    <header> titre "Comptes" + lien /ws/bank-accounts (icône flèche) </header>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      [3 tuiles stat: Clients, Banque, Crédits]
    </div>
  </section>

  <!-- Section Partenaires -->
  <section>
    <header> titre "Partenaires" + lien /ws/partners (icône flèche) </header>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      [2 tuiles stat: Partenaires, Crédits]
    </div>
  </section>
</div>
```

### Style des tuiles stat
- Conteneur: `bg-bg-elevated` (#FFFFFF), `border border-border-secondary` (#E6E4DE), `rounded-md`, `p-4`
- Icône: cercle badge `bg-primary/10` avec icône `text-primary` (#8A9A86)
- Valeur: `text-2xl font-semibold text-foreground` (#2D3430)
- Label: `text-sm text-foreground/60`
- Hover: `hover:border-primary` transition subtile (pas de `hoverable` Ant)

### Style des headers de section
- Flex row: titre `text-lg font-semibold` + lien `text-primary text-sm` avec icône RightOutlined
- Lien = navigation vers la page listing correspondante
- `mb-3` entre header et grille

### Separateur entre sections
- Remplacer `<Divider />` par `<div class="h-px bg-border-secondary my-6" />`

### Thème
- Utiliser uniquement les variables Tailwind existantes (`bg-elevated`, `border-secondary`, `text-foreground`, etc.)
- Palette: primary #8A9A86, bg-layout #EDECE7, bg-elevated #FFFFFF, foreground #2D3430

## Validation
- Visuel: pas de double bordure/card, rendu aéré et cohérent
- Navigation: chaque section header lien fonctionne vers /ws/bank-accounts et /ws/partners
- Responsive: grille 1 colonne mobile, 3 colonnes desktop
- Theme: couleurs matchent le ConfigProvider Ant + globals.css
