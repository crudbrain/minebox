# Add Share Button to Transaction Detail Drawer

## Goal
Add a "Partager" button to the `TransactionDetailDrawer` action row that opens the native share sheet via the Web Share API (`navigator.share`), with a formatted text message inspired by the reference Capacitor `Share.share()` code.

## No New Dependencies
`navigator.share` is a native browser API. No `@capacitor/share` needed (project has no Capacitor setup).

## Changes

### `components/bank-accounts/transaction-detail-drawer.tsx`

1. **Add `ShareAltOutlined` icon import** from `@ant-design/icons`

2. **Add "Partager" button** in the action row (alongside Imprimer / Exporter JPG):
   ```tsx
   <Button icon={<ShareAltOutlined />} onClick={handleShare}>
     Partager
   </Button>
   ```

3. **Implement `handleShare` function**:
   - Build the share text using the drawer's existing `getIntitule()` and `formatCurrency()` / `formatDate()` utilities (consistent with drawer display)
   - Account line uses `FIRSTNAME LASTNAME SURNAME (accountNumber)` in uppercase (matching reference pattern)
   - Company name at the bottom

   **Share text format:**
   ```
   *Détails*

   Date: *{formatDate(transaction.date)}*
   Intitulé: *{getIntitule(transaction)}*
   Montant: *{formatCurrency(transaction.amount, company?.currency)}*
   Solde: *{formatCurrency(transaction.balanceAfter, company?.currency)}*
   Note: *{transaction.message || "-"}*
   Compte: *{FIRSTNAME LASTNAME SURNAME (accountNumber)}*

   *{company?.name}*
   ```

   **Share title:** `Mouvement M{accountNumber}{transactionId.slice(-7)}`

4. **Web Share API usage:**
   ```ts
   const handleShare = async () => {
     if (!transaction || !navigator.share) return;
     await navigator.share({
       title: shareTitle,
       text: shareText,
     });
   };
   ```

5. **Fallback for unsupported browsers:** If `navigator.share` is not available, the button should still render but be disabled (or alternatively, copy text to clipboard with a success message). Use disabled + tooltip approach for simplicity:
   - If `typeof navigator.share === 'undefined'`, disable the button
   - Use antd `Tooltip` with "Non disponible sur ce navigateur" when disabled

## Share Text Derivation Details

- **Date**: `formatDate(transaction.date)` — same as drawer
- **Intitulé**: `getIntitule(transaction)` — same as drawer (e.g., "Encaissement de Jean Dupont")
- **Montant**: `formatCurrency(transaction.amount, company?.currency)` — uses company currency, not hardcoded USD
- **Solde**: `formatCurrency(transaction.balanceAfter, company?.currency)`
- **Note**: `transaction.message || "-"`
- **Compte**: `${firstName.toUpperCase()} ${lastName.toUpperCase()} ${surname?.toUpperCase() || ""} (${accountNumber})` — from `transaction.account` relation
- **Footer**: `*${company?.name}*`

## Implementation Order
1. Update `transaction-detail-drawer.tsx` with all changes above
2. Verify TypeScript compilation with `npx tsc --noEmit`
