# Plan : Coloration conditionnelle du Solde dans les Tables

## Objectif
Dans chaque colonne "Solde" des tables, afficher la valeur dans un `<Typography.Text>` avec :
- `type="success"` (vert) si solde >= 0
- `type="error"` (rouge) si solde < 0

## Fichiers à modifier (4)

### 1. `components/bank-accounts/bank-account-table.tsx`
- **Import** : ajouter `Typography` à l'import `"antd"` (ligne 3)
- **Render colonne Solde** (ligne 70) : remplacer
  ```tsx
  render: (balance: number) => formatCurrency(balance, company?.currency),
  ```
  par
  ```tsx
  render: (balance: number) => (
    <Typography.Text type={balance >= 0 ? "success" : "error"}>
      {formatCurrency(balance, company?.currency)}
    </Typography.Text>
  ),
  ```

### 2. `components/bank-accounts/bank-account-transactions.tsx`
- **Import** : ajouter `Typography` à l'import `"antd"` (ligne 3)
- **Render colonne Solde** (ligne 262) : remplacer
  ```tsx
  render: (balanceAfter: number) =>
    formatCurrency(balanceAfter, company?.currency),
  ```
  par
  ```tsx
  render: (balanceAfter: number) => (
    <Typography.Text type={balanceAfter >= 0 ? "success" : "error"}>
      {formatCurrency(balanceAfter, company?.currency)}
    </Typography.Text>
  ),
  ```

### 3. `components/partners/partner-table.tsx`
- **Import** : ajouter `Typography` à l'import `"antd"` (ligne 3)
- **Render colonne Solde** (ligne 52) : remplacer
  ```tsx
  render: (balance: number) => formatCurrency(balance, company?.currency),
  ```
  par
  ```tsx
  render: (balance: number) => (
    <Typography.Text type={balance >= 0 ? "success" : "error"}>
      {formatCurrency(balance, company?.currency)}
    </Typography.Text>
  ),
  ```

### 4. `components/partners/partner-transfers.tsx`
- **Import** : ajouter `Typography` à l'import `"antd"` (ligne 3)
- **Render colonne Solde** (ligne 221) : remplacer
  ```tsx
  render: (balanceAfter: number) =>
    formatCurrency(balanceAfter, company?.currency),
  ```
  par
  ```tsx
  render: (balanceAfter: number) => (
    <Typography.Text type={balanceAfter >= 0 ? "success" : "error"}>
      {formatCurrency(balanceAfter, company?.currency)}
    </Typography.Text>
  ),
  ```

## Validation
- Lancer le lint/typecheck pour vérifier l'absence d'erreurs
- Vérifier visuellement que les soldes négatifs apparaissent en rouge et les positifs en vert
