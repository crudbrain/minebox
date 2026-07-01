# Autoriser la modification du code partenaire

## Contexte
Dans `partner-form-modal.tsx`, le champ `code` est désactivé en mode édition (`disabled={isEdit}`), empêchant la modification du code d'un partenaire existant. Le backend supporte déjà cette modification (schema + API PUT).

## Plan

1. **Retirer `disabled={isEdit}` du champ code** dans `components/partners/partner-form-modal.tsx:72`
   - Remplacer `<Input disabled={isEdit} />` par `<Input />`

## Fichiers impactés
- `components/partners/partner-form-modal.tsx` (1 ligne)

## Validation
- Ouvrir un partenaire existant, cliquer "Modifier", vérifier que le champ code est éditable et que la mise à jour fonctionne.
