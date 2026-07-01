# Fix: react-to-print produces blank pages

## Problem
When clicking "Imprimer" (Print) for a transaction or transfer, a blank page is printed instead of the actual content.

## Root Cause Analysis

`react-to-print` v3.3.0 uses an **iframe-based approach**: it clones the `contentRef` DOM node, creates a hidden iframe, appends the clone to the iframe body, copies all `<style>` and `<link>` tags from the main document into the iframe `<head>`, and then calls `iframe.contentWindow.print()`.

### Issue 1: `@media print` CSS rules are counterproductive with iframe printing

In `bank-account-transactions.tsx` and `partner-transfers.tsx`, the `@media print` CSS includes:

```css
body * { visibility: hidden; }
.print-section, .print-section * { visibility: visible; }
```

This pattern is designed for **direct window printing** (where you need to hide everything except the print section). With `react-to-print`'s iframe approach, the iframe body contains ONLY the cloned `.print-section` div — there's nothing else to hide. These rules are **redundant** and can cause a blank page because:

1. Inside the iframe, `body * { visibility: hidden }` hides the entire cloned content
2. `.print-section { visibility: visible }` overrides it (higher specificity), BUT:
3. If Ant Design's CSS-in-JS inserts any `<style>` tags between the `body *` rule and the `.print-section` rule in the iframe's `<head>`, CSS cascade order could break the override
4. The `position: fixed; left: -9999` on `.print-section` is also unnecessary inside the iframe since that div IS the only content — the `position: static !important` override in `@media print` is needed, but the base `position: fixed; left: -9999` is still risky if the CSS cascade doesn't work perfectly

### Issue 2: Ant Design CSS-in-JS styles may not transfer correctly to iframe

Ant Design 6 uses `@ant-design/cssinjs` (via `AntdRegistry` / `StyleProvider` with custom cache). Styles are injected dynamically as `<style>` tags. `react-to-print` copies these by iterating `document.querySelectorAll("style")` and reading `sheet.cssRules`. This can fail if:
- Cross-origin restrictions prevent reading `sheet.cssRules`
- CSSOM-inserted rules have empty `innerText`/`textContent` (production builds)
- Styles are injected lazily and aren't present at the time of cloning

The Ant Design Table would render as completely unstyled (no borders, no cell padding, potentially invisible text) inside the iframe if its CSS-in-JS styles aren't transferred.

### Issue 3: Timing and state cleanup in `useEffect`

In `bank-account-transactions.tsx:111-121` and `partner-transfers.tsx:104-113`:

```js
useEffect(() => {
  if (printData !== null) {
    const timer = setTimeout(() => {
      handlePrint();
      setIsPrinting(false);
      setPrintData(null);  // Clears data immediately after triggering print
    }, 100);
    return () => clearTimeout(timer);
  }
}, [printData, handlePrint]);
```

- `handlePrint()` clones the content synchronously, but the iframe loading and style injection are async
- `setPrintData(null)` triggers a React re-render that sets the Table's `dataSource` to `[]`, potentially before the iframe has finished loading styles
- The 100ms delay may not be sufficient for complex Ant Design Table rendering

### Issue 4: Drawer components lack `@media print` body override

In `transaction-detail-drawer.tsx` and `transfer-detail-drawer.tsx`, the `componentRef` points to a div inside an Ant Design `Drawer` (which renders via a portal). The print only has `.print-only-header { display: block !important }` in `@media print`. Ant Design's Drawer portal styles could interfere with the iframe print if not properly handled.

## Fix Plan

### Step 1: Remove redundant `@media print` visibility rules from table print components

**Files:** `components/bank-accounts/bank-account-transactions.tsx`, `components/partners/partner-transfers.tsx`

- Remove `body * { visibility: hidden }` and `.print-section, .print-section * { visibility: visible }` from the `@media print` CSS
- Keep `.print-only-header { display: block !important }` in `@media print`
- Remove `position: fixed; left: -9999` from the print section div — instead, use `display: none` by default and show it only when printing. Or better, use `react-to-print`'s iframe approach properly by keeping the content in the DOM but hidden with a technique that doesn't affect the clone:
  - Change the print section style from `position: fixed; left: -9999` to just `display: none` normally, and remove the `position: static !important` override in `@media print`
  - Since `react-to-print` clones the content and puts it in its own iframe, the original div's display doesn't matter for the print output. The clone is always displayed in the iframe.

Actually, the simplest approach: keep the print section always rendered but visually hidden using a technique that doesn't interfere with the iframe print. Since `react-to-print` clones the DOM node, the clone will have whatever styles the original has. If the original has `display: none`, the clone will also have `display: none`, making it invisible in the iframe.

The best approach is:
- Keep `position: fixed; left: -9999` to visually hide the section on screen
- Remove ALL `@media print` rules except `.print-only-header { display: block !important }`
- The `position: static !important` and `left: auto !important` overrides in `@media print` are needed ONLY if the browser is printing the main window directly. Since `react-to-print` uses an iframe, these rules get copied into the iframe and apply there. Inside the iframe, the cloned div has `position: fixed; left: -9999` as inline style. The `@media print` `.print-section { position: static !important }` overrides this. This IS needed.
- BUT the `body * { visibility: hidden }` is NOT needed in the iframe and causes problems.

**Revised approach for the `@media print` block:**

```css
@media print {
  .print-only-header {
    display: block !important;
  }
  .print-section {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
  }
}
```

Remove:
- `body * { visibility: hidden; }`
- `.print-section, .print-section * { visibility: visible; }`

### Step 2: Fix timing and state cleanup in `useEffect`

**Files:** `components/bank-accounts/bank-account-transactions.tsx`, `components/partners/partner-transfers.tsx`

Change the `useEffect` to use `onAfterPrint` callback to clean up state, instead of clearing `printData` immediately:

```js
const handlePrint = useReactToPrint({
  contentRef: printRef,
  onAfterPrint: () => {
    setIsPrinting(false);
    setPrintData(null);
  },
});

const handlePrintClick = async () => {
  setIsPrinting(true);
  try {
    // fetch data...
    setPrintData(json.data || []);
  } catch {
    message.error("...");
    setIsPrinting(false);
  }
};

useEffect(() => {
  if (printData !== null) {
    const timer = setTimeout(() => {
      handlePrint();
    }, 200); // Increase timeout slightly
    return () => clearTimeout(timer);
  }
}, [printData, handlePrint]);
```

This ensures:
- `printData` stays populated while the iframe is being set up and printing
- State is cleaned up only after printing completes
- The Table inside the print section retains its data during the entire print process

### Step 3: Fix Drawer component print CSS

**Files:** `components/bank-accounts/transaction-detail-drawer.tsx`, `components/partners/transfer-detail-drawer.tsx`

The current `@media print` block only has `.print-only-header { display: block !important }`. This is correct for the iframe approach. No `body *` rules needed.

However, the Drawer content is rendered inside a portal (by Ant Design's Drawer). When `react-to-print` clones the `componentRef` div, the clone is a standalone DOM fragment — the Drawer portal styles won't affect it. The Ant Design `Descriptions` component styles should still be transferred via the style copying mechanism.

No changes needed for the CSS, but verify that Ant Design styles are being transferred correctly. If styles are missing, add `ignoreGlobalStyles: false` (which is the default) and ensure the `<style>` tags are accessible.

### Step 4: Add `preserveAfterPrint: true` for debugging (optional, remove after)

**All 4 files**

Temporarily add `preserveAfterPrint: true` to `useReactToPrint` options. This keeps the print iframe in the DOM after printing, allowing inspection to see if content was properly rendered with styles.

### Step 5: Handle Ant Design CSS-in-JS compatibility

If removing the `body *` rules doesn't fix the blank page, the issue is likely that Ant Design CSS-in-JS styles aren't being transferred to the iframe. Solutions:

1. **Use `onBeforePrint` to force Ant Design to inject styles before cloning:**
   ```js
   const handlePrint = useReactToPrint({
     contentRef: printRef,
     onBeforePrint: async () => {
       // Force a small delay to ensure CSS-in-JS styles are injected
       await new Promise(resolve => setTimeout(resolve, 100));
     },
   });
   ```

2. **Alternative: Use `pageStyle` to inject critical styles directly into the iframe:**
   This is a fallback approach if style copying fails.

3. **Alternative: Use Ant Design's `extractStyle` to get all CSS and inject via `pageStyle`:**
   ```js
   import { extractStyle } from '@ant-design/cssinjs';
   const handlePrint = useReactToPrint({
     contentRef: printRef,
     pageStyle: extractStyle(cache, { plain: true }),
   });
   ```
   This requires access to the Ant Design CSS-in-JS cache, which is managed by `AntdRegistry`.

## Files to Modify

1. `components/bank-accounts/bank-account-transactions.tsx` — Remove `body *` visibility rules, fix `useEffect` timing, add `onAfterPrint`
2. `components/partners/partner-transfers.tsx` — Same changes
3. `components/bank-accounts/transaction-detail-drawer.tsx` — Verify/fix print, no major changes expected
4. `components/partners/transfer-detail-drawer.tsx` — Verify/fix print, no major changes expected

## Validation

1. Click "Imprimer" on the transactions list → should print the table with data, not blank
2. Click "Imprimer" on the transfers list → should print the table with data, not blank
3. Open transaction detail drawer → click "Imprimer" → should print transaction details
4. Open transfer detail drawer → click "Imprimer" → should print transfer details
5. Check browser console for "There is nothing to print" errors
6. With `preserveAfterPrint: true`, inspect the print iframe to verify content and styles
