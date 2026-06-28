# Plan: Ajouter un Switch de statut sur la page détail d'un bankAccount

## Contexte
La page détail d'un compte bancaire (`bank-account-detail.tsx`) affiche le statut ("Actif"/"Bloqué") comme du texte statique. Pour améliorer l'UX, on ajoute un Switch qui permet de basculer le statut directement, avec confirmation via Modal centré.

## Fichier impacté
- `components/bank-accounts/bank-account-detail.tsx`

## Changements

### 1. Ajouter les imports nécessaires
- `Switch`, `Modal` from `antd`
- `useUpdateBankAccount` est déjà importé (utilisé uniquement pour delete actuellement — vérifier, non, il faut l'importer depuis `use-bank-accounts`)

### 2. Ajouter le state pour le Modal de confirmation
- `confirmOpen` (boolean) — contrôle l'ouverture du Modal
- `pendingBlocked` (boolean | null) — stocke la nouvelle valeur de `blocked` en attente de confirmation

### 3. Remplacer le Descriptions.Item "Statut" (ligne 60-62)
Remplacer :
```tsx
<Descriptions.Item label="Statut">
  {bankAccount.blocked ? "Bloqué" : "Actif"}
</Descriptions.Item>
```
Par :
```tsx
<Descriptions.Item label="Statut">
  <Switch
    checked={bankAccount.blocked}
    loading={updateMutation.isPending}
    onChange={(checked) => { setPendingBlocked(checked); setConfirmOpen(true); }}
    checkedChildren="Bloqué"
    unCheckedChildren="Actif"
  />
</Descriptions.Item>
```

### 4. Ajouter le hook useUpdateBankAccount
- Déclarer `const updateMutation = useUpdateBankAccount();` dans le composant

### 5. Ajouter le Modal de confirmation inline
```tsx
<Modal
  centered
  open={confirmOpen}
  onConfirm={handleStatusChange}
  onCancel={() => setConfirmOpen(false)}
  okText="Confirmer"
  cancelText="Annuler"
  okButtonProps={{ loading: updateMutation.isPending }}
>
  <p>
    Voulez-vous {pendingBlocked ? "bloquer" : "activer"} le compte N° {bankAccount.accountNumber} ?
    Cette action peut être annulée à tout moment.
  </p>
</Modal>
```

### 6. Ajouter la fonction handleStatusChange
```tsx
const handleStatusChange = () => {
  updateMutation.mutate(
    { id: bankAccount.id, data: { blocked: pendingBlocked } },
    {
      onSuccess: () => {
        message.success(pendingBlocked ? "Compte bloqué" : "Compte activé");
        setConfirmOpen(false);
      },
      onError: () => {
        message.error("Échec de l'opération");
      },
    }
  );
};
```

### 7. Ajouter l'import de `message` depuis `antd`
Déjà utilisé dans d'autres composants du projet (bank-account-form-modal.tsx).

## Validation
- Le Switch reflète correctement l'état `blocked` du compte
- Le clic sur le Switch ouvre un Modal centré avec le texte détaillé adapté (bloquer/activer)
- La confirmation appelle `useUpdateBankAccount` avec `{ id, data: { blocked } }`
- Le toast de succès/erreur s'affiche
- Le Switch montre un loading pendant la mutation
- Le query cache est invalidé par le hook existant (`useUpdateBankAccount` invalide déjà `["bank-accounts"]` et `["bank-account", id]`)
- Le bouton "Modifier" existant continue de fonctionner normalement

## Risques
- Aucun risque majeur : l'API `updateBankAccount` est déjà utilisée par le form modal pour des mises à jour partielles
- Le Modal se ferme uniquement en cas de succès (onSuccess) — en cas d'erreur, l'utilisateur peut réessayer
