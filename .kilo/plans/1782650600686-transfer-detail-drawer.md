# Add Transfer Detail Drawer for Partners

## Goal
Create a `TransferDetailDrawer` component (similar to `TransactionDetailDrawer`) that opens on row click in the partner transfers table. It displays transfer details with an Imprimer button and a dropdown for Modifier/Supprimer actions. The existing Actions column (Edit/Delete buttons) in the transfers table is removed.

## Affected Files

### 1. NEW: `components/partners/transfer-detail-drawer.tsx`

A new drawer component modeled after `components/bank-accounts/transaction-detail-drawer.tsx`, but simplified:

**Props:**
```ts
interface TransferDetailDrawerProps {
  open: boolean;
  transfer: any | null;
  onClose: () => void;
  onEdit: (transfer: any) => void;
  onDelete: (transfer: any) => void;
}
```

**Layout:**
- Title: `"Détails du transfert"`
- Extra: `<Dropdown>` with Modifier/Supprimer items (same pattern as TransactionDetailDrawer)
- Action row: only **Imprimer** button (no Exporter JPG, no Partager)
- Print-only header with company logo/name (same as TransactionDetailDrawer)
- `<Descriptions bordered column={1}>` with these rows:

| Label | Value |
|---|---|
| Date | `formatDate(transfer.date)` |
| Type | `"Transfert d'argent"` for `MONEY_TRANSFER`, `"Transfert d'or"` for `GOLD_TRANSFER` |
| Expéditeur | `transfer.sender` |
| Montant | `formatCurrency(transfer.amount, company?.currency)` |
| Solde | `formatCurrency(transfer.balanceAfter, company?.currency)` |
| Note | `transfer.message \|\| "-"` |
| Autres informations | `transfer.operator?.name \|\| "-"` |

**Print support:**
- `useReactToPrint` with `contentRef` pointing to the content div
- Print-only header (hidden by default, visible on print) with company logo + name
- Print CSS media query (same as TransactionDetailDrawer)

**Imports needed:**
- `useRef` from React
- `Drawer, Descriptions, Button, Dropdown` from antd
- `MoreOutlined, PrinterOutlined` from @ant-design/icons
- `useReactToPrint` from react-to-print
- `useCompany` from `@/lib/hooks/use-company`
- `formatCurrency, formatDate` from `@/lib/utils`

### 2. MODIFY: `components/partners/partner-transfers.tsx`

**Remove:**
- The **Actions column** from `columns` (the column with EditOutlined/DeleteOutlined buttons)
- `EditOutlined, DeleteOutlined` icon imports (no longer used directly in table)
- `Space` import from antd (only used in Actions column)

**Add:**
- Import `TransferDetailDrawer` from `./transfer-detail-drawer`
- State: `selectedTransfer`, `drawerOpen`
- `onRow` prop on `<Table>`: click sets selectedTransfer + opens drawer
- `<TransferDetailDrawer>` component instance after the Table, wired to:
  - `onEdit`: opens existing edit modal (same logic as current Edit button)
  - `onDelete`: sets `deleteTarget` (same logic as current Delete button)

**State variables to add:**
```ts
const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
const [drawerOpen, setDrawerOpen] = useState(false);
```

**Table onRow:**
```tsx
onRow={(record) => ({
  onClick: () => {
    setSelectedTransfer(record);
    setDrawerOpen(true);
  },
  style: { cursor: "pointer" },
})}
```

**Drawer wiring:**
```tsx
<TransferDetailDrawer
  open={drawerOpen}
  transfer={selectedTransfer}
  onClose={() => {
    setDrawerOpen(false);
    setSelectedTransfer(null);
  }}
  onEdit={(record) => {
    setEditingTransfer(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setDrawerOpen(false);
    setModalOpen(true);
  }}
  onDelete={(record) => {
    setDeleteTarget(record);
  }}
/>
```

**`useMemo` deps update:** Remove `handleDelete` from deps (it wasn't actually used in columns anymore after removing Actions column). Keep `company?.currency`.

## Notes
- `transfer.balanceAfter` is computed by the API (`computeTransferBalances`) only when `partnerId` is in the query — which it always is in this component since `partnerId` is a required prop.
- `transfer.operator` is included by the API (`include: { operator: true, partner: true }`).
- The existing edit modal and delete confirmation modal in `partner-transfers.tsx` remain unchanged — only the trigger mechanism changes (from table buttons to drawer dropdown).
- `transfer.sender` is a plain string field on the Transfer model (not a relation).

## Validation
- Run `npx tsc --noEmit` to verify TypeScript compilation
- Verify drawer opens on row click
- Verify Imprimer button works
- Verify Modifier/Supprimer dropdown items work (open edit modal / confirm delete)
