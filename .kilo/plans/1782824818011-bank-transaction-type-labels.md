# Plan: Labels type de transaction bankAccount — "Entrée (Encaissement)" / "Sortie (Décaissement)" / "Transfert"

## Contexte
Les utilisateurs trouvent les labels "Dépôt" / "Retrait" / "Transfert" dans le formulaire de transaction pas assez explicites. On veut afficher des labels plus clairs : "Entrée (Encaissement)" pour DEPOSIT, "Sortie (Décaissement)" pour WITHDRAWAL, et "Transfert" pour TRANSFER.

## Changement requis

### 1. `components/bank-accounts/bank-account-transactions.tsx` — ligne 390-393

Remplacer les labels du Select du formulaire :

```tsx
// Avant
{ value: "DEPOSIT", label: "Dépôt" },
{ value: "WITHDRAWAL", label: "Retrait" },
{ value: "TRANSFER", label: "Transfert" },

// Après
{ value: "DEPOSIT", label: "Entrée (Encaissement)" },
{ value: "WITHDRAWAL", label: "Sortie (Décaissement)" },
{ value: "TRANSFER", label: "Transfert" },
```

### Fichiers non modifiés
- `components/bank-accounts/transaction-detail-drawer.tsx` — utilise déjà "Encaissement"/"Décaissement"/"Transfert" dans `getIntitule()`, approprié pour le contexte détail.
- Backend, schéma Prisma, validation Zod — inchangés, seuls les labels UI du formulaire changent.

## Validation
- Ouvrir le formulaire "Nouvelle transaction" sur un bankAccount
- Vérifier que le dropdown Type affiche : "Entrée (Encaissement)", "Sortie (Décaissement)", "Transfert"
- Vérifier que la sélection fonctionne correctement (les valeurs envoyées restent DEPOSIT/WITHDRAWAL/TRANSFER)
- Vérifier que la condition `transactionType === "TRANSFER"` affiche toujours les champs de transfert
