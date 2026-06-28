# Ajouter filtre Dates et bouton Imprimer sur la liste des transferts d'un Partenaire

## Contexte
`PartnerTransfers` (`components/partners/partner-transfers.tsx`) affiche la table des transferts d'un partenaire. L'API, le hook `useTransfers`, et la couche API supportent déjà `dateFrom`/`dateTo` — aucune modification backend nécessaire.

Le pattern à reproduire est identique à celui déjà implémenté dans `BankAccountTransactions` (`components/bank-accounts/bank-account-transactions.tsx`).

## Fichier à modifier

**`components/partners/partner-transfers.tsx`**

### 1. Filtre Dates (RangePicker)

- Ajouter `DatePicker.RangePicker` dans la toolbar, avant le bouton "Nouveau transfert".
- Ajouter un state `dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null` (initialisé à `null`).
- Passer `dateFrom` et `dateTo` au hook `useTransfers` dérivés du `dateRange` (format ISO string via `dayjs.toISOString()`).
- Activer `allowClear` sur le RangePicker pour réinitialiser le filtre.
- Quand `dateRange` change, remettre `page` à 1.
- Toolbar passe de `flex justify-end` à `flex justify-between items-center` : RangePicker à gauche, boutons à droite.

### 2. Bouton Imprimer

- Ajouter un bouton `PrinterOutlined` dans la toolbar, à côté du bouton "Nouveau transfert".
- Ajouter `useRef` pour la section imprimable (`printRef`).
- Utiliser `useReactToPrint` avec ce ref (déjà installé et utilisé dans `TransferDetailDrawer`).
- Au clic sur Imprimer, déclencher un `fetch` manuel vers `/api/transfers?pageSize=99999&partnerId={partnerId}&dateFrom=...&dateTo=...` pour charger tous les transferts filtrés. Stocker le résultat dans un state `printData`.
- Quand `printData` est setté, `useEffect` déclenche `handlePrint()` après un court délai (100ms) pour laisser le DOM se mettre à jour.
- Loading state `isPrinting` sur le bouton Imprimer.

### 3. Section imprimable

Placée hors écran (`position: fixed; left: -9999px`), contient :

- **Header print-only** (masqué à l'écran via `display: none`, affiché en impression via `@media print`) : logo + nom de la company (même pattern que `TransferDetailDrawer`).
- **Titre** : "Historique des transferts"
- **Sous-titre** : "Partenaire {code}" (via `usePartner(partnerId)` → `partner.code`). Si un filtre date est actif, ajouter la période (ex: "Période : 01/01/2025 - 31/12/2025").
- **Table Ant Design** avec les mêmes colonnes que la table principale (Date, Expéditeur, Entrée, Sortie, Qté Or, Type de transfert, Solde, Note), `dataSource={printData}`, `pagination={false}`, `bordered`, `size="small"`.

### 4. CSS @media print

```css
@media print {
  .print-only-header {
    display: block !important;
  }
  body * {
    visibility: hidden;
  }
  .print-section, .print-section * {
    visibility: visible;
  }
  .print-section {
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
  }
}
```

## Imports à ajouter

- `PrinterOutlined` depuis `@ant-design/icons`
- `useRef, useEffect` depuis `react`
- `useReactToPrint` depuis `react-to-print`
- `usePartner` depuis `@/lib/hooks/use-partners`
- `const { RangePicker } = DatePicker;`

## Structure visuelle de la toolbar

```
[RangePicker]  [Imprimer]  [Nouveau transfert]
```

## Validation
- Le filtre Date filtre bien les résultats de la table (vérifier les paramètres URL et la requête API).
- Le bouton Imprimer charge tous les transferts filtrés et ouvre la boîte d'impression du navigateur.
- L'impression montre le header (logo + nom company), le titre avec "Partenaire {code}" et la période, et la table complète sans pagination.
