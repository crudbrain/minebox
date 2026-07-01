# Plan : Renommer le label "Type" en "Type d'opération"

## Contexte
Les formulaires et l'affichage de détail utilisent le label "Type" pour le champ type d'opération. Il doit être renommé en "Type d'opération" pour plus de clarté.

## Tâches

1. **`components/partners/partner-transfers.tsx:340`** — Remplacer `label="Type"` par `label="Type d'opération"`
2. **`components/bank-accounts/bank-account-transactions.tsx:387`** — Remplacer `label="Type"` par `label="Type d'opération"`
3. **`components/partners/transfer-detail-drawer.tsx:109`** — Remplacer `<Descriptions.Item label="Type">` par `<Descriptions.Item label="Type d'opération">`

## Validation
- Vérifier que les 3 fichiers sont modifiés correctement
- Lancer le linter/typecheck du projet
