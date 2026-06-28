# Plan: TRANSFER entre deux BankAccounts — Implémenter la logique bidirectionnelle

## Contexte
Actuellement, une transaction de type `TRANSFER` est traitée comme un simple `WITHDRAWAL` : un seul compte est débité, aucun compte destination n'est crédité. La logique de transfert entre deux BankAccounts n'existe pas.

## Décisions de design

### Champs ajoutés au modèle Transaction
- **`fromAccountId`** (`String?`, optionnel) — compte source du transfert. Requis si `type=TRANSFER`.
- **`toAccountId`** (`String?`, optionnel) — compte destination du transfert. Requis si `type=TRANSFER`.
- **`transferGroupId`** (`String?`, optionnel) — identifiant partagé par les 2 transactions créées lors d'un TRANSFER (généré via `cuid()`).

### Rôle des champs
- **`accountId`** : liaison BankAccount ↔ Transaction (existant, obligatoire pour tous les types). Indique le compte sur lequel la transaction apparaît.
- **`fromAccountId`** / **`toAccountId`** : identités techniques du transfert, identiques sur les 2 transactions d'un même TRANSFER.

### Comportement TRANSFER — 2 transactions atomiques
Quand un TRANSFER de A→B est créé (montant X) :

| Transaction | accountId | fromAccountId | toAccountId | type | amount | balanceAfter |
|---|---|---|---|---|---|---|
| Tx1 (débit) | A | A | B | TRANSFER | X | balance_A - X |
| Tx2 (crédit) | B | A | B | TRANSFER | X | balance_B + X |

- Les 2 transactions partagent le même `transferGroupId`.
- Les 2 transactions ont `type=TRANSFER`.
- Les 2 transactions ont le même `amount`, `date`, `title`, `message`, `goldQuantity`.
- Chaque transaction est liée à son propre BankAccount via `accountId`.

### computeTransactionBalances
- Pour la transaction sur le compte source (accountId = fromAccountId) : `balanceAfter -= amount`
- Pour la transaction sur le compte destination (accountId = toAccountId) : `balanceAfter += amount`

### Modèle Transfer (Partner) — inchangé
Le modèle `Transfer` existant (Partner ↔ Transfer) est un flux séparé et reste inchangé.

## Tâches

### 1. Modifier le schéma Prisma — `prisma/schema.prisma`

Ajouter au modèle `Transaction` :
```prisma
model Transaction {
  // ... champs existants ...
  fromAccountId    String?       @map("from_account_id")
  toAccountId      String?       @map("to_account_id")
  transferGroupId  String?       @map("transfer_group_id")
  fromAccount      BankAccount?  @relation("transaction_from", fields: [fromAccountId], references: [id])
  toAccount        BankAccount?  @relation("transaction_to", fields: [toAccountId], references: [id])
}
```

Ajouter au modèle `BankAccount` :
```prisma
model BankAccount {
  // ... champs existants ...
  fromTransactions  Transaction[] @relation("transaction_from")
  toTransactions    Transaction[] @relation("transaction_to")
}
```

### 2. Générer et appliquer la migration
```bash
npx prisma validate
npx prisma format
npx prisma migrate dev --name add_transfer_fields_to_transaction
```

### 3. Modifier le schema Zod — `lib/schemas/transaction.ts`

```ts
export const transactionCreateSchema = z.object({
  date: z.string().datetime().or(z.date()),
  amount: z.number().positive("Le montant doit être positif"),
  goldQuantity: z.string().optional(),
  title: z.string().optional(),
  message: z.string().default(""),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER"]),
  accountId: z.string().min(1, "Compte requis"),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "TRANSFER") {
      return !!data.fromAccountId && !!data.toAccountId && data.fromAccountId !== data.toAccountId;
    }
    return true;
  },
  { message: "fromAccountId et toAccountId sont requis et doivent être différents pour un TRANSFER" }
);
```

### 4. Modifier l'API POST — `app/api/transactions/route.ts`

Logique de création pour TRANSFER :
```ts
if (type === "TRANSFER") {
  const { fromAccountId, toAccountId } = parsed.data;
  // Valider que les 2 comptes existent
  const fromAccount = await prisma.bankAccount.findUnique({ where: { id: fromAccountId } });
  const toAccount = await prisma.bankAccount.findUnique({ where: { id: toAccountId } });
  if (!fromAccount || !toAccount) return 404;

  const transferGroupId = cuid(); // ou crypto.randomUUID()

  const result = await prisma.$transaction(async (tx) => {
    // Tx1: débit sur fromAccount (accountId=fromAccountId)
    const t1 = await tx.transaction.create({
      data: {
        ...commonData,
        accountId: fromAccountId,
        fromAccountId,
        toAccountId,
        transferGroupId,
      },
    });
    await tx.bankAccount.update({
      where: { id: fromAccountId },
      data: { balance: fromAccount.balance - amount },
    });

    // Tx2: crédit sur toAccount (accountId=toAccountId)
    const t2 = await tx.transaction.create({
      data: {
        ...commonData,
        accountId: toAccountId,
        fromAccountId,
        toAccountId,
        transferGroupId,
      },
    });
    await tx.bankAccount.update({
      where: { id: toAccountId },
      data: { balance: toAccount.balance + amount },
    });

    return [t1, t2];
  });

  return NextResponse.json(result, { status: 201 });
}
// DEPOSIT / WITHDRAWAL : logique existante (inchangée)
```

### 5. Modifier computeTransactionBalances — `app/api/transactions/route.ts`

```ts
function computeTransactionBalances(transactions: any[]) {
  let balanceAfter = 0;
  return transactions.map((t) => {
    if (t.type === "DEPOSIT") balanceAfter += t.amount;
    else if (t.type === "WITHDRAWAL") balanceAfter -= t.amount;
    else if (t.type === "TRANSFER") {
      if (t.accountId === t.fromAccountId) balanceAfter -= t.amount;
      else if (t.accountId === t.toAccountId) balanceAfter += t.amount;
    }
    return { ...t, balanceAfter };
  });
}
```

### 6. Modifier le GET — `app/api/transactions/route.ts`

Ajouter les includes pour les nouvelles relations :
```ts
include: { operator: true, account: true, fromAccount: true, toAccount: true },
```

### 7. Modifier l'UI — `components/bank-accounts/bank-account-transactions.tsx`

- Ajouter un Select pour `fromAccountId` dans le formulaire, visible uniquement si type=TRANSFER.
- Ajouter un Select pour `toAccountId` dans le formulaire, visible uniquement si type=TRANSFER.
- Les options des Select sont les BankAccounts (nécessite un hook `useBankAccounts` ou équivalent).
- Afficher les infos fromAccount/toAccount dans la table pour les transactions de type TRANSFER.

### 8. Modifier l'API client — `lib/api/transactions.ts`

Pas de changement structurel requis, `createTransaction` passe déjà `any`.

### 9. Valider
- Créer un TRANSFER entre deux comptes via l'UI.
- Vérifier que les 2 transactions sont créées avec le même transferGroupId.
- Vérifier que les soldes des 2 comptes sont mis à jour (débit + crédit).
- Vérifier que l'historique des 2 comptes affiche la transaction respective.
- Vérifier que computeTransactionBalances calcule correctement le solde pour les 2 comptes.
- Vérifier que DEPOSIT et WITHDRAWAL fonctionnent toujours normalement.

## Risques
- **Migration** : Les champs fromAccountId, toAccountId, transferGroupId sont tous optionnels (nullable), donc la migration est non-destructive pour les données existantes.
- **Transactions existantes de type TRANSFER** : Elles auront fromAccountId=null, toAccountId=null. Elles continueront à fonctionner comme avant (traitées comme WITHDRAWAL dans computeTransactionBalances). À corriger manuellement si nécessaire.
- **Suppression d'un TRANSFER** : Quand on supprime une transaction TRANSFER, il faut aussi supprimer/annuler la transaction liée (même transferGroupId) et ajuster les soldes des 2 comptes. Cela devra être géré dans l'API DELETE.
- **Rollback atomique** : Les 2 créations + 2 mises à jour de solde sont dans un `prisma.$transaction`, donc soit tout réussit soit rien.

## Questions ouvertes
- **API DELETE/PUT** : Comment gérer la suppression ou mise à jour d'une transaction TRANSFER ? Faut-il automatiquement supprimer/modifier les 2 transactions liées (même transferGroupId) ? Ce n'est pas dans le scope de ce plan mais devra être traité ensuite.
