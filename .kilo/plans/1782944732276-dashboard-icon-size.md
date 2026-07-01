# Réduire la taille des icônes du dashboard — supprimer le cercle

## Contexte
Les `StatTile` du dashboard (`app/ws/(dashboard)/page.tsx`) affichent les icônes dans un cercle `w-10 h-10` (40px) avec `text-lg`, ce qui les rend trop grandes pour un dashboard épuré. L'utilisateur souhaite supprimer le cercle de fond.

## Changement

### Fichier : `app/ws/(dashboard)/page.tsx`

Dans le composant `StatTile` (lignes 16-24), remplacer :

```tsx
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
  <span className="text-primary text-lg">{icon}</span>
</div>
```

Par :

```tsx
<span className="text-primary text-base block mb-3">{icon}</span>
```

- Supprime le cercle de fond (`w-10 h-10 rounded-full bg-primary/10`)
- Réduit la taille de l'icône de `text-lg` à `text-base`
- Conserve `text-primary` et `mb-3` pour le style et l'espacement

## Validation
- Vérifier visuellement le dashboard : les icônes doivent apparaître sans cercle et à une taille modérée
- Vérifier que l'espacement `mb-3` reste cohérent entre icône, valeur et label
