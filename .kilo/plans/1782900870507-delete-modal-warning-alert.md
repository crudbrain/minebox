# Plan: Ajouter une Alert warning dans le modal de suppression

## Contexte
Le `ConfirmDeleteModal` (`components/shared/confirm-delete-modal.tsx`) est un composant partagé utilisé dans 5 endroits. Pour la suppression d'un bankAccount ou d'un partenaire, il faut afficher une Alert Ant Design avec icone attention et un message détaillant les conséquences de la suppression (cascade des données associées).

## Tâches

1. **Modifier `components/shared/confirm-delete-modal.tsx`** :
   - Ajouter `Alert` à l'import antd
   - Ajouter prop optionnelle `warningMessage?: string` à `ConfirmDeleteModalProps`
   - Rendre `<Alert type="warning" showIcon message={warningMessage} />` au-dessus du `<p>` existant quand `warningMessage` est fourni

2. **Modifier `components/bank-accounts/bank-account-detail.tsx`** :
   - Passer `warningMessage="Le compte sera définitivement supprimé, y compris ses mouvements et opérations associées. Cette action est irréversible et ne peut pas être annulée une fois effectuée."`

3. **Modifier `components/partners/partner-detail.tsx`** :
   - Passer `warningMessage="Le partenaire sera définitivement supprimé, y compris ses mouvements et opérations associées. Cette action est irréversible et ne peut pas être annulée une fois effectuée."`

4. **Aucun changement** pour les autres appelants (transactions, transfers, users) — pas de `warningMessage` passé.

## Validation
- Vérifier que le lint/typecheck passe après les modifications
- Vérifier visuellement que l'Alert warning apparait dans les modals de suppression bankAccount et partner uniquement
