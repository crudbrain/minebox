# Replace deprecated `width` with `size` on Ant Design Drawer

## Context
Antd v6 deprecated the `width` prop on `<Drawer>` in favor of `size`. The `size` prop accepts:
- `"default"` → 378px
- `"large"` → 736px
- A `number` or `string` for custom pixel values (e.g. `size={280}`)

## Files to change

| File | Current `width` value | New `size` value |
|------|----------------------|------------------|
| `components/ws/sidebar.tsx:133` | `width={280}` | `size={280}` |
| `components/bank-accounts/bank-account-form-drawer.tsx:87` | `width={isMobile ? "100vw" : 520}` | `size={isMobile ? "100vw" : 520}` |
| `components/bank-accounts/bank-account-transactions.tsx:370` | `width={isMobile ? "calc(100vw - 32px)" : undefined}` | `size={isMobile ? "calc(100vw - 32px)" : undefined}` |
| `components/bank-accounts/transaction-detail-drawer.tsx:157` | `width={isMobile ? "100vw" : 480}` | `size={isMobile ? "100vw" : 480}` |
| `components/settings/company-edit-drawer.tsx:66` | `width={isMobile ? "100vw" : 520}` | `size={isMobile ? "100vw" : 520}` |
| `components/settings/user-edit-drawer.tsx:59` | `width={isMobile ? "100vw" : 420}` | `size={isMobile ? "100vw" : 420}` |
| `components/settings/user-create-drawer.tsx:48` | `width={isMobile ? "100vw" : 420}` | `size={isMobile ? "100vw" : 420}` |
| `components/partners/partner-transfers.tsx:323` | `width={isMobile ? "calc(100vw - 32px)" : undefined}` | `size={isMobile ? "calc(100vw - 32px)" : undefined}` |
| `components/partners/transfer-detail-drawer.tsx:72` | `width={isMobile ? "100vw" : 480}` | `size={isMobile ? "100vw" : 480}` |
| `app/ws/settings/users/page.tsx:415` | `width={isMobile ? "100vw" : 480}` | `size={isMobile ? "100vw" : 480}` |

Also check `components/shared/confirm-delete-modal.tsx:46` and `components/partners/partner-form-modal.tsx:58` — these use `width` on a **Modal**, not a Drawer, so they are unaffected.

## Steps
1. In each file above, replace `width=` with `size=` on the `<Drawer>` component.
2. Run `npx tsc --noEmit` to confirm no deprecation or type errors remain.

## Risk
Low — `size` with a numeric/string value behaves identically to the old `width` per the antd v6 source. The only difference is the prop name.
