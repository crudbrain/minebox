# Fix: Formulaires de modification ne chargeant pas les données

## Contexte

Les modals de formulaire utilisant `destroyOnHidden` + `clearOnDestroy` ne chargent pas les données existantes en mode édition. Le problème affecte 4 composants.

## Cause racine

`destroyOnHidden` détruit le DOM du modal à la fermeture. Quand le modal s'ouvre :
1. Le Form est recréé depuis zéro (champs non enregistrés)
2. `form.setFieldsValue()` dans `useEffect` s'exécute avant que les Form.Item ne soient montés et enregistrés
3. Les valeurs ne sont jamais appliquées aux champs

Dans `bank-account-transactions.tsx` et `partner-transfers.tsx`, le problème est pire : `form.setFieldsValue` est appelé dans `onEdit` **avant** `setModalOpen(true)`, donc les champs n'existent pas du tout.

## Fichiers affectés et corrections

### 1. `components/bank-accounts/bank-account-form-modal.tsx`

Remplacer le `useEffect` + `form.setFieldsValue` par `initialValues` sur le `<Form>` :
- Pour le mode création : `initialValues` avec `accountNumber` vide (le numéro généré sera set via un useEffect séparé qui fonctionne car il n'y a pas de race condition — les fields existent déjà quand le useEffect tourne la 2ème fois)
- Pour le mode édition : `initialValues={bankAccount}`
- Garder le `useEffect` uniquement pour le `generatedNumber` en mode création, mais utiliser `form.setFieldValue` avec un guard `if (open && !isEdit && generatedNumber)` — celui-ci fonctionne car les fields sont déjà montés au 2ème render

### 2. `components/partners/partner-form-modal.tsx`

Remplacer le `useEffect` + `form.setFieldsValue(partner)` par `initialValues={partner}` sur le `<Form>`.
Supprimer le `useEffect` devenu inutile (et l'import `useEffect`).

### 3. `components/bank-accounts/bank-account-transactions.tsx`

Remplacer l'appel `form.setFieldsValues` dans le callback `onEdit` par un `useEffect` qui se déclenche quand `editingTransaction` et `open` changent :
- Déplacer la logique `form.setFieldsValues({ ...record, date: dayjs(record.date) })` dans un `useEffect` qui réagit à `[modalOpen, editingTransaction, form]`
- Dans `onEdit`, seulement faire `setEditingTransaction(record); setDrawerOpen(false); setModalOpen(true);`

### 4. `components/partners/partner-transfers.tsx`

Même correction que #3 :
- Déplacer `form.setFieldsValues` de `onEdit` vers un `useEffect` réagissant à `[modalOpen, editingTransfer, form]`
- Dans `onEdit`, seulement faire `setEditingTransfer(record); setDrawerOpen(false); setModalOpen(true);`

## Validation

- Ouvrir chaque modal en mode édition et vérifier que les champs sont pré-remplis
- Ouvrir chaque modal en mode création et vérifier que les champs sont vides
- `npx next build` compile sans erreur
