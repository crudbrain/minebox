# Plan : Renommer le label "Date" et ajouter la selection des secondes

## Contexte
Les formulaires de transaction bancaire et de transfert utilisent le label "Date" et un format `HH:mm` sans secondes. Le label doit devenir "Date de l'opération" et le picker doit permettre de choisir les secondes.

## Tâches

1. **`components/bank-accounts/bank-account-transactions.tsx:398`** — Remplacer `label="Date"` par `label="Date de l'opération"`
2. **`components/bank-accounts/bank-account-transactions.tsx:402`** — Remplacer `format="DD/MM/YYYY HH:mm"` par `format="DD/MM/YYYY HH:mm:ss"` (Ant Design `showTime` affiche les secondes automatiquement quand le format les inclut)
3. **`components/partners/partner-transfers.tsx:350`** — Remplacer `label="Date"` par `label="Date de l'opération"`
4. **`components/partners/partner-transfers.tsx:354`** — Remplacer `format="DD/MM/YYYY HH:mm"` par `format="DD/MM/YYYY HH:mm:ss"`

## Validation
- Lancer `npx tsc --noEmit` (ESLint timeout dans cet environnement)
