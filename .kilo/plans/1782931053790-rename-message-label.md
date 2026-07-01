# Plan : Renommer le label "Message" en "Message (Observation)"

## Contexte
Les formulaires de transaction bancaire et de transfert utilisent le label "Message" pour le champ observation. Le label doit devenir "Message (Observation)".

## Tâches

1. **`components/bank-accounts/bank-account-transactions.tsx:453`** — Remplacer `label="Message"` par `label="Message (Observation)"`
2. **`components/partners/partner-transfers.tsx:375`** — Remplacer `label="Message"` par `label="Message (Observation)"`

## Validation
- Lancer `npx tsc --noEmit` (ESLint timeout dans cet environnement)
