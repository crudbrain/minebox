# Plan : Zone rouge "Supprimer" sur les pages de détails

## Objectif
Ajouter une zone rouge (danger zone) contenant un bouton "Supprimer" sur les pages de détails d'un bankAccount et d'un partner. Ce bouton déclenche le `ConfirmDeleteModal` puis supprime l'entité via les hooks existants.

## Décisions
- **Style** : Carte Ant Design (`Card`) avec style danger (bordure rouge, fond rouge clair)
- **Redirection** : Après suppression, naviguer vers la liste (`/ws/bank-accounts` ou `/ws/partners`)

## Tâches

### 1. Modifier `components/bank-accounts/bank-account-detail.tsx`
- Ajouter imports : `Card`, `DeleteOutlined` (antd), `useRouter` (next/navigation), `useDeleteBankAccount` (hook), `ConfirmDeleteModal`
- Ajouter state `deleteOpen` (boolean) pour le modal
- Ajouter `useDeleteBankAccount()` et `useRouter()`
- Ajouter en bas du composant, après `<BankAccountFormModal>`, une section :
  ```
  <Card
    style={{ borderColor: '#ffccc7', backgroundColor: '#fff2f0' }}
    title={<span style={{ color: '#cf1322' }}>Zone danger</span>}
  >
    <p>Supprimer ce compte bancaire. Cette action est irréversible.</p>
    <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteOpen(true)}>
      Supprimer
    </Button>
  </Card>
  <ConfirmDeleteModal
    open={deleteOpen}
    onClose={() => setDeleteOpen(false)}
    onConfirm={handleDelete}
    entityName={`le compte bancaire "${bankAccount.accountNumber}"`}
    loading={deleteMutation.isPending}
  />
  ```
- `handleDelete` : appelle `deleteMutation.mutate(bankAccount.id, { onSuccess: () => router.push('/ws/bank-accounts') })`

### 2. Modifier `components/partners/partner-detail.tsx`
- Même pattern que ci-dessus mais avec les imports/entités partner
- Imports : `Card`, `DeleteOutlined`, `useRouter`, `useDeletePartner`, `ConfirmDeleteModal`
- State `deleteOpen`
- Zone danger avec `Card` stylisée rouge
- `ConfirmDeleteModal` avec `entityName={`le partenaire "${partner.code}"`}`
- `handleDelete` : `deleteMutation.mutate(partner.id, { onSuccess: () => router.push('/ws/partners') })`

## Fichiers modifiés
- `components/bank-accounts/bank-account-detail.tsx`
- `components/partners/partner-detail.tsx`

## Risques
- Aucun risque de régression : ce sont des ajouts purs, le comportement existant (bouton Modifier, Descriptions) n'est pas modifié
