# Plan: Refactoriser les formulaires Modal vers le pattern Ant Design officiel

## Contexte

Les 4 composants utilisant des formulaires dans des Modals suivent un pattern incorrect : `footer={null}` + bouton submit dans le `<Form>`. Le pattern Ant Design officiel utilise les props du Modal (`okText`, `cancelText`, `okButtonProps`) pour les boutons d'action, et `modalRender` pour envelopper le contenu dans un `<Form>`.

## Fichiers affectés

1. `components/bank-accounts/bank-account-form-modal.tsx`
2. `components/partners/partner-form-modal.tsx`
3. `components/bank-accounts/bank-account-transactions.tsx`
4. `components/partners/partner-transfers.tsx`

## Changements par fichier

### Pour tous les fichiers

1. **Supprimer** `footer={null}` du Modal
2. **Ajouter** sur le Modal :
   - `okText` (dynamique : "Créer" / "Enregistrer" selon mode édition)
   - `cancelText="Annuler"`
   - `okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: mutation.isPending }}`
3. **Supprimer** le `<Button htmlType="submit" ...>` du Form
4. **Remplacer** `<Form ...>` autour des Form.Items par `modalRender={(dom) => <Form ... clearOnDestroy onFinish={handleSubmit}>{dom}</Form>}`
5. **Supprimer** les appels redondants à `form.resetFields()` (dans `onCancel` et callbacks `onSuccess`) car `clearOnDestroy` s'en charge
6. **Supprimer** les `useEffect` de reset (`if (!open) { form.resetFields() }`) car `clearOnDestroy` les remplace

### Fichier 1: `bank-account-form-modal.tsx`

- `okText={isEdit ? "Enregistrer" : "Créer"}`
- `okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}`
- Supprimer lignes 134-143 (Button submit dans Form)
- Remplacer `<Form form={form} layout="vertical" onFinish={handleSubmit}>` par `modalRender`
- Supprimer le `useEffect` de reset (lignes 38-40 : `if (!open) { form.resetFields() }`)

### Fichier 2: `partner-form-modal.tsx`

- `okText={isEdit ? "Enregistrer" : "Créer"}`
- `okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}`
- Supprimer lignes 81-88 (Button submit dans Form)
- Remplacer `<Form form={form} layout="vertical" onFinish={handleSubmit}>` par `modalRender`
- Supprimer le `useEffect` de reset (lignes 26-28 : `if (!open) { form.resetFields() }`)

### Fichier 3: `bank-account-transactions.tsx`

- `okText={editingTransaction ? "Enregistrer" : "Créer"}`
- `okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}`
- Supprimer lignes 320-327 (Button submit dans Form)
- Remplacer `<Form form={form} layout="vertical" onFinish={handleSubmit}>` par `modalRender`
- Supprimer `form.resetFields()` dans `onCancel` (lignes 254)
- Supprimer `form.resetFields()` dans les callbacks `onSuccess` (lignes 87, 99)

### Fichier 4: `partner-transfers.tsx`

- `okText={editingTransfer ? "Enregistrer" : "Créer"}`
- `okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}`
- Supprimer lignes 256-263 (Button submit dans Form)
- Remplacer `<Form form={form} layout="vertical" onFinish={handleSubmit}>` par `modalRender`
- Supprimer `form.resetFields()` dans `onCancel` (ligne 213)
- Supprimer `form.resetFields()` dans les callbacks `onSuccess` (lignes 62, 76)

## Validation

- Lancer `npm run build` pour vérifier l'absence d'erreurs TypeScript
- Tester manuellement l'ouverture/fermeture de chaque modal pour vérifier que :
  - Le formulaire se soumet correctement
  - Le formulaire se réinitialise à la fermeture
  - Le loading s'affiche sur le bouton OK pendant la mutation
  - Le bouton Annuler ferme le modal
