# Change Adresse field from Input to TextArea in forms

## Context
Three forms use `<Input />` for the "Adresse" field. Addresses often need multiple lines, so it should be a `<Input.TextArea rows={3} />` instead — consistent with existing TextArea usage in `company-edit-drawer.tsx:99`.

## Task
Replace `<Input />` with `<Input.TextArea rows={3} />` for the "Adresse" field in these 3 files:

1. `components/bank-accounts/bank-account-form-drawer.tsx` — line 179: `<Input />` → `<Input.TextArea rows={3} />`
2. `components/settings/company-edit-drawer.tsx` — line 119: `<Input />` → `<Input.TextArea rows={3} />`
3. `components/setup/setup-form.tsx` — line 173: `<Input />` → `<Input.TextArea rows={3} />`

## No other changes needed
- `Input` is already imported in all 3 files; `Input.TextArea` is a sub-component of Ant Design's `Input`.
- No schema or backend changes required — the `address` field is already `z.string().optional()` which accepts multiline text.
- No changes to detail/display views — those already render address as plain text.
