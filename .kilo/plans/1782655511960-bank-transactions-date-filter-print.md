# Ajouter filtre Dates et bouton Imprimer sur la liste des transactions

## Contexte
`BankAccountTransactions` (`components/bank-accounts/bank-account-transactions.tsx`) affiche la table des transactions d'un compte bancaire. L'API et le hook supportent déjà `dateFrom`/`dateTo`.

## Modifications

### 1. Filtre Dates (RangePicker)

**Fichier :** `components/bank-accounts/bank-account-transactions.tsx`

- Ajouter `DatePicker.RangePicker` (déjà importé de `antd`) dans la toolbar (`div.flex.justify-end.mb-4`), avant le bouton "Nouvelle transaction".
- Ajouter un state `dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null` (initialisé à `null`).
- Passer `dateFrom` et `dateTo` au hook `useTransactions` dérivés du `dateRange` (format ISO string).
- Activer `allowClear` sur le RangePicker pour réinitialiser le filtre.
- Quand `dateRange` change, remettre `page` à 1.

### 2. Bouton Imprimer

**Fichier :** `components/bank-accounts/bank-account-transactions.tsx`

- Ajouter un bouton `PrinterOutlined` dans la toolbar, à côté du bouton "Nouvelle transaction".
- Ajouter un `useRef` pour la section imprimable.
- Utiliser `useReactToPrint` (`react-to-print` déjà installé) avec ce ref.
- Au clic sur Imprimer, déclencher une requête sans pagination (`pageSize: 99999`) via `useTransactions` avec les mêmes filtres `accountId`, `dateFrom`, `dateTo`. Stocker le résultat dans un state `allFilteredTransactions`.
- La section imprimable (`ref`) contient :
  - **Header print-only** (masqué à l'écran via CSS, affiché en impression) : logo + nom de la company (même pattern que `TransactionDetailDrawer`).
  - **Titre personnalisé** : "Historique des transactions" + sous-titre avec les infos du bankAccount (prénom, nom, numéro de compte). Si un filtre date est actif, ajouter la période dans le sous-titre (ex: "Période : 01/01/2025 - 31/12/2025").
  - **Table Ant Design `<Table>`** avec les mêmes colonnes que la table principale (Date, Intitulé, Entrée, Sortie, Solde, Note), `dataSource` = `allFilteredTransactions`, pagination désactivée (`pagination={false}`).
- Ajouter un bloc `<style>` avec `@media print` pour :
  - Cacher la toolbar et la table principale (seulement la section imprimable est visible).
  - Afficher le header print-only.
  - Cacher le drawer/modal et autres éléments non pertinents.

### 3. Requête pour l'impression

- Créer un hook `useTransactions` séparé (ou réutiliser le même) avec `pageSize: 99999` pour charger toutes les transactions filtrées. Ce hook est activé uniquement quand l'utilisateur clique sur Imprimer (via un state `printRequested` ou similaire), pour éviter de charger toutes les données en permanence.
- Alternative plus simple : utiliser un state `printData` et faire un `fetch` manuel dans le handler du bouton Imprimer, puis déclencher l'impression une fois les données chargées.

## Structure visuelle de la toolbar

```
[RangePicker]  [Imprimer]  [Nouvelle transaction]
```

La toolbar passe de `flex justify-end` à `flex justify-between` : RangePicker à gauche, boutons à droite.

## Validation
- Le filtre Date filtre bien les résultats de la table (vérifier les paramètres URL et la requête API).
- Le bouton Imprimer charge toutes les transactions filtrées et ouvre la boîte d'impression du navigateur.
- L'impression montre le header (logo + nom company), le titre avec les infos du compte et la période, et la table complète sans pagination.
