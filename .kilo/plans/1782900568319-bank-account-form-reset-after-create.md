# Fix: Bank Account Form Not Resetting After Creation

## Problem
After creating a bank account, when opening the drawer again to create another, the form retains the previous values. The `destroyOnClose` prop on the Drawer destroys child DOM, but Ant Design's `Form` `initialValues` only applies on first mount. The `useEffect` hooks only set the generated account number — other fields are never reset.

## Root Cause
`bank-account-form-drawer.tsx:43-53` — The effects only set `accountNumber` (create mode) or all fields from `bankAccount` (edit mode). In create mode, non-account-number fields are never cleared between openings.

## Fix
Add a `useEffect` that resets the entire form to initial values when the drawer opens in create mode. Call `form.resetFields()` when `open` becomes `true` and `!isEdit`, then let the existing effect set the generated account number afterward.

### File: `components/bank-accounts/bank-account-form-drawer.tsx`

1. Add a `useEffect` before the existing ones:
```tsx
useEffect(() => {
  if (open && !isEdit) {
    form.resetFields();
  }
}, [open, isEdit, form]);
```

This ensures every time the drawer opens for creation, all fields are cleared to their `initialValues` first. The subsequent effect for the generated account number will then populate just that field.

## Validation
- Create a bank account, close the drawer, open it again → form should be empty (except auto-generated account number)
- Edit a bank account, close drawer, open create drawer → form should be empty
- Edit a bank account, close, re-open edit → should show current bank account data
