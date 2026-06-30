# Plan : Correction des failles formulaires Transaction & Transfert

## Contexte

Les formulaires de création/modification de transactions et transferts présentent des failles critiques (déséquilibre financier), des failles de validation frontend, des problèmes d'UX et d'ordre des champs, et une incohérence dans la suppression des transferts.

---

## Tâches

### 1. Restriction de l'édition des transactions TRANSFER (API)

**Fichiers** : `app/api/transactions/[id]/route.ts`, `lib/schemas/transaction.ts`

- Créer `transactionUpdateSchema` dédié (pas un `.partial()` du schema create) qui autorise uniquement : `date`, `amount`, `goldQuantity`, `title`, `message`
- Les champs `type`, `accountId`, `fromAccountId`, `toAccountId` sont **interdits en modification**
- Dans le PUT, valider avec ce schema restrictif
- Ajuster le calcul du solde : si la transaction existante est de type TRANSFER, il faut ajuster **les deux comptes** (fromAccount et toAccount) quand `amount` change
- Frontend : quand `editingTransaction` existe, désactiver (disabled) le champ `type` dans le Select

### 2. Restriction de l'édition des transferts (API)

**Fichiers** : `app/api/transfers/[id]/route.ts`, `lib/schemas/transfer.ts`

- Créer `transferUpdateSchema` dédié qui autorise uniquement : `date`, `amount`, `goldQuantity`, `sender`, `message`
- `type` et `partnerId` sont **interdits en modification**
- Frontend : quand `editingTransfer` existe, désactiver le champ `type`

### 3. Correction du calcul du solde lors de l'édition d'un TRANSFER

**Fichier** : `app/api/transactions/[id]/route.ts`

- Quand `amount` change sur une transaction de type TRANSFER, ajuster le solde des **deux** comptes :
  - Compte source (fromAccountId) : oldAmount → newAmount (débit)
  - Compte destination (toAccountId) : oldAmount → newAmount (crédit)
- Logique : si ancien montant était X et nouveau montant est Y
  - fromAccount : `balance += (X - Y)` (moins de débit si montant baisse)
  - toAccount : `balance += (Y - X)` (moins de crédit si montant baisse)

### 4. Soft delete pour les transferts

**Fichiers** : `app/api/transfers/[id]/route.ts`, `app/api/transfers/route.ts`, `prisma/schema.prisma`

- Ajouter `deleted Boolean @default(false) @map("deleted")` au model Transfer dans `schema.prisma`
- Dans le GET des transferts, filtrer `where: { deleted: false }` (comme les transactions)
- Dans le DELETE, passer en soft delete (`update where: { id }, data: { deleted: true }`) au lieu de `transfer.delete`
- Générer la migration Prisma

### 5. Remplacer `<Input type="number">` par `<InputNumber>`

**Fichiers** : `components/bank-accounts/bank-account-transactions.tsx`, `components/partners/partner-transfers.tsx`

- `amount` : `<InputNumber min={0.01} step={0.01} className="w-full" />` (remplace `<Input type="number">`)
- `goldQuantity` : `<InputNumber min={0.01} step={0.01} className="w-full" />` (remplace `<Input>`)
- `InputNumber` retourne un `number`, ce qui corrige F9 (string envoyée au lieu de number)
- Ajouter `InputNumber` à l'import ant-design en remplacement de l'import non utilisé

### 6. Anti-double-soumission

**Fichiers** : `components/bank-accounts/bank-account-transactions.tsx`, `components/partners/partner-transfers.tsx`

- Le Form a déjà `disabled={createMutation.isPending || updateMutation.isPending}`, ce qui désactive tous les champs
- S'assurer que le bouton OK du Modal a bien `loading={createMutation.isPending || updateMutation.isPending}` — c'est déjà le cas
- Ajouter un état local `submitting` si besoin pour couvrir le délai entre clic et `isPending`

### 7. Réordonner les champs du formulaire Transaction

**Fichier** : `components/bank-accounts/bank-account-transactions.tsx` (lignes 379-437)

Nouvel ordre dans le Modal :
1. **Type** (Select DEPOSIT/WITHDRAWAL/TRANSFER)
2. **Date** (DatePicker)
3. **Titre** (Input)
4. **Montant** (InputNumber min=0.01 step=0.01)
5. **Quantité d'or** (InputNumber — toujours visible)
6. **Compte source** (si TRANSFER, Select disabled)
7. **Compte destination** (si TRANSFER, Select)
8. **Message** (TextArea)

De plus, quand `editingTransaction` existe, le champ Type doit être `disabled`.

### 8. Réordonner les champs du formulaire Transfert

**Fichier** : `components/partners/partner-transfers.tsx` (lignes 331-367)

Nouvel ordre dans le Modal :
1. **Type** (Select MONEY_TRANSFER/GOLD_TRANSFER) — disabled si édition
2. **Date** (DatePicker)
3. **Expéditeur** (Input)
4. **Montant** (InputNumber min=0.01 step=0.01)
5. **Quantité d'or** (InputNumber — conditionnel, visible uniquement si type = GOLD_TRANSFER)
6. **Message** (TextArea)

De plus, quand `editingTransfer` existe, le champ Type doit être `disabled`.

### 9. goldQuantity conditionnel dans le formulaire Transfert

**Fichier** : `components/partners/partner-transfers.tsx`

- Ajouter `const transferType = Form.useWatch("type", form);`
- Afficher le champ `goldQuantity` uniquement quand `transferType === "GOLD_TRANSFER"`

### 10. Validation du montant dans le formulaire Transaction (type TRANSFER)

**Fichier** : `components/bank-accounts/bank-account-transactions.tsx`

- Quand `type === "TRANSFER"`, vérifier que `fromAccountId !== toAccountId` côté frontend (ajouter une règle de validation Form.Item ou un `Form.useWatch` + message)

---

## Risques

- **Migration DB** : l'ajout du champ `deleted` sur Transfer nécessite une migration Prisma. S'assurer que la migration est exécutée avant le déploiement.
- **Changement du schema de validation** : le `transactionUpdateSchema` restrictif pourrait casser des clients qui envoient actuellement des champs non autorisés. Comme seul le frontend utilise ces endpoints, le risque est limité.

## Validation

- Tester la création d'une transaction DEPOSIT, WITHDRAWAL, TRANSFER
- Tester la modification du montant d'un TRANSFER et vérifier les soldes des deux comptes
- Tester que la modification du type est bloquée en édition
- Tester la suppression douce (soft delete) d'un transfert
- Tester que `<InputNumber>` envoie bien un number et non une string
- Tester l'ordre des champs dans les deux formulaires (création et édition)
- Tester que `goldQuantity` n'apparaît que pour GOLD_TRANSFER dans le formulaire transfert
