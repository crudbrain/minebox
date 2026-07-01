# Plan : Ajouter le suffixe currency sur les champs Montant

## Objectif
Sur les formulaires, le champ Montant doit toujours afficher la devise de l'entreprise (company.currency) en suffixe via `addonAfter` sur le composant `InputNumber` d'Ant Design.

## Contexte
- La devise de l'entreprise est stockée dans `company.currency` (enum `IsoCodeCurrency`: USD | CDF)
- Les deux formulaires impactés utilisent déjà `useCompany()` et ont `company` disponible localement
- Ant Design `InputNumber` supporte `addonAfter` pour afficher un suffixe

## Changements

### 1. `components/bank-accounts/bank-account-transactions.tsx` (ligne 405)
- Remplacer `<InputNumber min={0.01} step={0.01} className="w-full" />`
- Par `<InputNumber min={0.01} step={0.01} className="w-full" addonAfter={company?.currency} />`

### 2. `components/partners/partner-transfers.tsx` (ligne 361)
- Remplacer `<InputNumber min={0.01} step={0.01} className="w-full" />`
- Par `<InputNumber min={0.01} step={0.01} className="w-full" addonAfter={company?.currency} />`

## Non concerné
- Les champs "Quantité d'or" ne reçoivent pas le suffixe currency (hors périmètre)
- Les formulaires d'affichage (tableaux, drawers) utilisent déjà `formatCurrency()` qui inclut la devise

## Validation
- Vérifier que le suffixe s'affiche correctement (USD ou CDF) dans les deux modals de création/édition
- Vérifier que le champ reste fonctionnel (saisie, validation)
- Lancer le typecheck pour confirmer l'absence d'erreurs de typage
