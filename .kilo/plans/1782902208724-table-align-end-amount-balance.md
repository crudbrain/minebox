# Plan : Align "end" sur les colonnes montant/solde des Tables

## Objectif
Ajouter `align: "end"` à toute colonne de Table qui affiche un montant ou un solde.

## Fichiers et colonnes concernés

### 1. `components/bank-accounts/bank-account-transactions.tsx`
- Colonne "Entrée" (line ~222) : ajouter `align: "end"`
- Colonne "Sortie" (line ~238) : ajouter `align: "end"`
- Colonne "Solde" (line ~254) : ajouter `align: "end"`

### 2. `components/bank-accounts/bank-account-table.tsx`
- Colonne "Solde" (line ~64) : ajouter `align: "end"`

### 3. `components/partners/partner-transfers.tsx`
- Colonne "Entrée" (line ~181) : ajouter `align: "end"`
- Colonne "Sortie" (line ~189) : ajouter `align: "end"`
- Colonne "Solde" (line ~213) : ajouter `align: "end"`

### 4. `components/partners/partner-table.tsx`
- Colonne "Solde" (line ~47) : ajouter `align: "end"`

## Non concerné
- `app/ws/settings/users/page.tsx` : aucune colonne montant/solde

## Modification type
Pour chaque colonne concernée, ajouter la propriété `align: "end"` au même niveau que `title`, `key`, `render`, etc.

Exemple avant :
```ts
{
  title: "Solde",
  dataIndex: "balance",
  key: "balance",
  render: (balance: number) => formatCurrency(balance, company?.currency),
},
```

Exemple après :
```ts
{
  title: "Solde",
  dataIndex: "balance",
  key: "balance",
  align: "end",
  render: (balance: number) => formatCurrency(balance, company?.currency),
},
```

## Validation
- Vérifier visuellement que les colonnes montant/solde sont alignées à droite dans chaque table.
- Lancer le lint/typecheck pour s'assurer qu'il n'y a pas d'erreur.
