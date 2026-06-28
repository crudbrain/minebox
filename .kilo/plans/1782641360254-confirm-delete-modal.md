# Plan: Reusable ConfirmDeleteModal Component

## Context

All delete actions in the app currently execute immediately without user confirmation:
- `components/bank-accounts/bank-account-transactions.tsx:107-118` — transaction delete (direct mutation)
- `components/partners/partner-transfers.tsx:83-95` — transfer delete (direct mutation)
- `app/ws/settings/users/page.tsx:178-193` — user delete (`Modal.confirm`, no text-typing guard)

The project uses a consistent **Modal + Form via `modalRender`** pattern where the Modal's OK button has `htmlType: 'submit'` to trigger `Form.onFinish`. All form modals follow this convention.

## Tasks

### 1. Create `components/shared/confirm-delete-modal.tsx`

Reusable component with this API:

```tsx
interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  entityName: string;
  loading?: boolean;
}
```

Implementation:
- Use `Modal` + `Form` via `modalRender` (matching existing pattern in `bank-account-form-modal.tsx` etc.)
- Single `Form.Item` named `"confirmText"` with a validation rule: `validator` that checks value === `"Supprimer"`
- `Form` has `clearOnDestroy` to reset input on close
- OK button: `htmlType: 'submit'`, `danger: true`, `loading: loading`, disabled via form validation (only enabled when input === "Supprimer")
- Cancel button: calls `onClose`
- `destroyOnHidden` on Modal
- `onFinish` calls `onConfirm` prop
- Body text: `Voulez-vous vraiment supprimer {entityName} ? Cette action est irréversible.`
- Input placeholder: `Tapez "Supprimer" pour confirmer`

### 2. Integrate into `components/bank-accounts/bank-account-transactions.tsx`

- Add state: `const [deleteTarget, setDeleteTarget] = useState<any>(null)`
- Replace direct `handleDelete(record.id)` call on delete button click with `setDeleteTarget(record)`
- Replace existing `handleDelete` to work through `ConfirmDeleteModal.onConfirm`
- Add `<ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }} entityName={`la transaction "${deleteTarget?.title || deleteTarget?.id}"`} loading={deleteMutation.isPending} />`

### 3. Integrate into `components/partners/partner-transfers.tsx`

Same pattern as task 2:
- Add state: `const [deleteTarget, setDeleteTarget] = useState<any>(null)`
- Replace direct `handleDelete(record.id)` with `setDeleteTarget(record)`
- Add `ConfirmDeleteModal` with `entityName` like `le transfert`

### 4. Integrate into `app/ws/settings/users/page.tsx`

- Add state: `const [deleteUserId, setDeleteUserId] = useState<string | null>(null)`
- Replace `Modal.confirm` in `handleDelete` with setting `deleteUserId`
- Add `ConfirmDeleteModal` that calls `authClient.admin.removeUser` in `onConfirm`
- Keep `refetch()` on success

## Notes

- antd v6 is used (`"antd": "^6.4.5"`). The user's example used `<Space orientation="vertical">` which is not valid in antd — the component will use standard layout instead.
- The `Form.useForm()` hook + `form.getFieldValue` or validation rule is used to control the OK button disabled state. Since `modalRender` wraps the Form, the OK button's disabled state should be driven by form validation — but antd Modal OK button doesn't automatically sync with Form validation. Alternative: use `Form.useWatch("confirmText", form)` to watch the field value and set `okButtonProps.disabled` accordingly, which is the simplest and most reliable approach matching the user's example intent.

## Validation

- After all changes, verify `npm run build` passes with no type errors
- Test each delete flow: transaction delete, transfer delete, user delete — each should show the modal, require typing "Supprimer", then execute the deletion
