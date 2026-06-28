# Transaction Detail Drawer Plan

## Goal
When clicking a transaction row in the bank account transactions table, open an Ant Design `Drawer` showing the transaction details. The Drawer uses `Descriptions` (1 column) to display key fields, has a `Dropdown` (hidden behind `MoreOutlined` icon button) with "Modifier" and "Supprimer" actions, and supports Print (via `react-to-print`) and Export as JPG (via `html-to-image`).

## No Backend Changes
All transaction data is already fetched with `include: { operator, account, fromAccount, toAccount }` in the GET endpoint.

## New Dependencies
- `react-to-print` — for printing the transaction detail
- `html-to-image` — for exporting the transaction as a `.jpg` image

## New Component: `components/bank-accounts/transaction-detail-drawer.tsx`

### Props
```ts
interface TransactionDetailDrawerProps {
  open: boolean;
  transaction: any | null;
  onClose: () => void;
  accountId: string;           // current bank account ID (needed for edit modal + transfer context)
  onEdit: (transaction: any) => void;
  onDelete: (transaction: any) => void;
}
```

### Drawer Structure
1. **Drawer title**: `"Détails de la transaction"` with a `MoreOutlined` icon button in `extra` prop containing a `Dropdown` menu with:
   - `"Modifier"` item → calls `onEdit(transaction)`
   - `"Supprimer"` item → calls `onDelete(transaction)` (danger style)
2. **Drawer body** has two zones:
   - **Action buttons row** (outside the print/export zone): Print + Export JPG buttons using `PrinterOutlined` and `FileImageOutlined` icons
   - **Ref-printable zone** (`ref={componentRef}`): the content that gets printed/exported

### Printable/Exportable Zone Layout
This zone renders differently for Drawer vs Print/Export:
- **In Drawer**: normal white background, standard styling
- **When printed/exported**: includes a header block at the top

#### Header block (visible only in print/export via CSS `@media print` + always included for image export)
- Company logo (`company.logo`) + company name (`company.name`)
- Styled as a top banner

#### Intitulé derivation
- `DEPOSIT` → `"Encaissement"` (on export) / `"Encaissement de [accountName]"` (in Drawer)
- `WITHDRAWAL` → `"Décaissement"` (on export) / `"Décaissement de [accountName]"` (in Drawer)
- `TRANSFER` → `"Transfert de [fromName] à [toName]"` (both Drawer and export)

### Descriptions Component (1 column, bordered)
Fields displayed (label → value mapping):
| Label | Source |
|---|---|
| Date | `formatDate(transaction.date)` |
| Intitulé | derived from type + account names (see above) |
| Montant | `formatCurrency(transaction.amount, company?.currency)` |
| Solde | `formatCurrency(transaction.balanceAfter, company?.currency)` |
| Note | `transaction.message || "-"` |
| No compte | `transaction.account.accountNumber` |
| Autres informations | `"Opérateur: {operator.name}"` |

### Print (react-to-print)
- Use `useReactToPrint` hook with `contentRef` pointing to the printable zone ref
- Print button triggers the print

### Export as JPG (html-to-image)
- Use `toJpeg` from `html-to-image` on the printable zone ref
- Generate filename: `MOV{accountNumber}-{transactionId.slice(-7)}.jpg` (matching the MOV190-2400045.jpg pattern)
- Trigger download via creating a temporary `<a>` element

## Changes to Existing Files

### `components/bank-accounts/bank-account-transactions.tsx`
1. Add state: `selectedTransaction` and `drawerOpen`
2. Make table rows clickable: add `onRow` prop to `<Table>` that sets `selectedTransaction` and opens drawer on click
3. Remove the "Actions" column (edit/delete buttons) from the table columns
4. Add row hover cursor style (`cursor: pointer`)
5. Render `<TransactionDetailDrawer>` component passing:
   - `open`, `transaction`, `onClose`, `accountId`
   - `onEdit`: sets `editingTransaction`, populates form, opens the existing Modal
   - `onDelete`: sets `deleteTarget` (triggers existing `ConfirmDeleteModal`)
6. Keep the existing Modal (for creating/editing) and ConfirmDeleteModal as-is
7. Remove `EditOutlined` and `DeleteOutlined` from imports (no longer used in columns), add `MoreOutlined` if needed

### `package.json`
- Add `react-to-print` and `html-to-image` dependencies

## Implementation Order
1. Install `react-to-print` and `html-to-image`
2. Create `components/bank-accounts/transaction-detail-drawer.tsx`
3. Update `components/bank-accounts/bank-account-transactions.tsx` to integrate the drawer

## Key Design Decisions
- Drawer uses `Descriptions` with `column={1}` and `bordered` (single-column layout)
- Edit/Delete hidden behind `MoreOutlined` Dropdown (cleaner UI)
- The printable/exportable zone includes company header for the exported image
- Intitulé on export omits account name for DEPOSIT/WITHDRAWAL, includes names for TRANSFER
- No backend changes required
