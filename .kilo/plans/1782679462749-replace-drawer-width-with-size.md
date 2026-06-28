# Replace antd Drawer `width` with `size` prop

## Context

Antd v6 (currently `^6.4.5`) deprecates the `width` prop on `Drawer` in favor of the `size` prop. The `size` prop accepts `"default"`, `"large"`, or a number/string for custom widths.

## Changes

Replace `width={N}` with `size={N}` in all 6 Drawer usages to preserve exact pixel widths while using the non-deprecated API:

| File | Line | Old | New |
|------|------|-----|-----|
| `components/partners/transfer-detail-drawer.tsx` | 69 | `width={480}` | `size={480}` |
| `components/bank-accounts/transaction-detail-drawer.tsx` | 156 | `width={480}` | `size={480}` |
| `app/ws/settings/users/page.tsx` | 373 | `width={480}` | `size={480}` |
| `components/settings/user-edit-drawer.tsx` | 56 | `width={420}` | `size={420}` |
| `components/settings/user-create-drawer.tsx` | 45 | `width={420}` | `size={420}` |
| `components/settings/company-edit-drawer.tsx` | 63 | `width={520}` | `size={520}` |

**Note:** `components/ws/sidebar.tsx:54` uses `Layout.Sider` with `width={260}` — this is a different component and is not affected.

## Validation

- Run the dev server and verify no antd Drawer deprecation warnings appear in the browser console.
- Verify Drawer widths are unchanged visually.
