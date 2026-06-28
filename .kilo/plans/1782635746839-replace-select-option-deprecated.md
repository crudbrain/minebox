# Replace deprecated `Select.Option` with `options` prop

Antd 5.x deprecated `Select.Option` in favor of the `options` prop. Three files use `Select.Option` and need updating.

## Changes

### 1. `components/bank-accounts/bank-account-form-modal.tsx` (lines 107-110)

Replace:
```tsx
<Select placeholder="Sélectionner">
  <Select.Option value="M">Masculin</Select.Option>
  <Select.Option value="F">Féminin</Select.Option>
</Select>
```

With:
```tsx
<Select placeholder="Sélectionner" options={[
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" },
]} />
```

### 2. `components/bank-accounts/bank-account-transactions.tsx` (lines 275-279)

Replace:
```tsx
<Select placeholder="Sélectionner">
  <Select.Option value="DEPOSIT">Dépôt</Select.Option>
  <Select.Option value="WITHDRAWAL">Retrait</Select.Option>
  <Select.Option value="TRANSFER">Transfert</Select.Option>
</Select>
```

With:
```tsx
<Select placeholder="Sélectionner" options={[
  { value: "DEPOSIT", label: "Dépôt" },
  { value: "WITHDRAWAL", label: "Retrait" },
  { value: "TRANSFER", label: "Transfert" },
]} />
```

### 3. `components/partners/partner-transfers.tsx` (lines 234-237)

Replace:
```tsx
<Select placeholder="Sélectionner">
  <Select.Option value="MONEY_TRANSFER">Transfert d'argent</Select.Option>
  <Select.Option value="GOLD_TRANSFER">Transfert d'or</Select.Option>
</Select>
```

With:
```tsx
<Select placeholder="Sélectionner" options={[
  { value: "MONEY_TRANSFER", label: "Transfert d'argent" },
  { value: "GOLD_TRANSFER", label: "Transfert d'or" },
]} />
```

## Validation

- Run `npx tsc --noEmit` to confirm no type errors
- Verify the deprecation warning (ts6385) is gone
