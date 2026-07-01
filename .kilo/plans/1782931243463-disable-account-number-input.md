# Plan : Rendre "Numéro de compte" non-editable en mode création

## Contexte
Dans le formulaire de création d'un compte bancaire (`bank-account-form-drawer.tsx`), le champ "Numéro de compte" est actuellement editable en mode création (`disabled={isEdit}` — désactivé uniquement en édition). Le numéro est auto-généré via `useGenerateAccountNumber`. Le champ doit être non-editable dans tous les modes.

## Tâches

1. **`components/bank-accounts/bank-account-form-drawer.tsx:121`** — Remplacer `<Input disabled={isEdit} />` par `<Input disabled />`

## Validation
- Lancer `npx tsc --noEmit`
