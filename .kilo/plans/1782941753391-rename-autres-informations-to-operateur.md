# Remplacer "Autres informations" par "Opérateur" dans les drawers et exports

## Contexte
Les drawers de détail affichent actuellement le champ opérateur sous le label "Autres informations". Ce label doit être changé en "Opérateur" pour plus de clarté. Les exports image (JPG) et impression utilisent le même composant `Descriptions`, donc le changement s'applique automatiquement.

## Tâches

1. **`components/partners/transfer-detail-drawer.tsx:126`**
   - Remplacer `label="Autres informations"` par `label="Opérateur"`

2. **`components/bank-accounts/transaction-detail-drawer.tsx:225-228`**
   - Remplacer `label="Autres informations"` par `label="Opérateur"`
   - Simplifier la valeur : remplacer `` `Opérateur: ${transaction.operator.name}` `` par `transaction.operator.name` (le label "Opérateur" suffit, pas besoin de le répéter dans la valeur)

## Notes
- Le texte de partage (`handleShare`) dans le transaction drawer ne contient pas de champ "Autres informations", donc aucun changement nécessaire.
- Les exports JPG et impression héritent automatiquement du changement car ils rendent le même `Descriptions` via `componentRef`.
