# Retirer le champ balance initiale du formulaire partenaire

## Contexte
La balance initiale d'un partenaire doit toujours être 0. Le champ "Solde initial" doit être retiré du formulaire de création, et le serveur doit forcer la valeur 0.

## Changements

### 1. `components/partners/partner-form-modal.tsx`
- Supprimer le `Form.Item` "Solde initial" (lignes 79-85)
- Supprimer `balance: Number(values.balance)` dans `handleSubmit` (ligne 27)

### 2. `lib/schemas/partner.ts`
- `partnerCreateSchema` : retirer `balance: z.number().default(0)` (la balance n'est plus une entrée utilisateur)
- `partnerUpdateSchema` : retirer `balance` s'il est hérité (vérifier que le `.partial()` sur `partnerCreateSchema` ne propage pas un champ balance résiduel). Le schéma update ne doit pas accepter de balance non plus.

### 3. `app/api/partners/route.ts`
- Dans `POST`, forcer `balance: 0` dans les données passées à `prisma.partner.create` (ne pas dépendre du body)

## Validation
- Créer un partenaire depuis le formulaire : seul le champ "Code" est visible
- Vérifier en base que `balance` vaut 0 pour le nouveau partenaire
- Vérifier que l'édition d'un partenaire existant fonctionne toujours (sans champ balance)
