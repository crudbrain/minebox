# Plan: Ajouter `closable={{placement:"end"}}` sur tous les Drawer

## Contexte
Le prop `closable` avec `placement:"end"` place le bouton de fermeture du Drawer à droite (end). Actuellement seul `sidebar.tsx` l'a. Il faut l'ajouter aux 7 autres Drawer.

## Tâches

Pour chaque fichier ci-dessous, ajouter `closable={{placement:"end"}}` comme prop du composant `<Drawer>` :

1. **`components/bank-accounts/bank-account-form-drawer.tsx`** — ligne 91
2. **`components/settings/company-edit-drawer.tsx`** — ligne 64
3. **`app/ws/settings/users/page.tsx`** — ligne 413
4. **`components/partners/transfer-detail-drawer.tsx`** — ligne 68
5. **`components/settings/user-create-drawer.tsx`** — ligne 46
6. **`components/settings/user-edit-drawer.tsx`** — ligne 57
7. **`components/bank-accounts/transaction-detail-drawer.tsx`** — ligne 153

`components/ws/sidebar.tsx` est déjà fait (ligne 140).

## Validation
- Linter / typecheck le projet après les changements pour vérifier qu'il n'y a pas d'erreurs de typage sur le prop `closable`.
