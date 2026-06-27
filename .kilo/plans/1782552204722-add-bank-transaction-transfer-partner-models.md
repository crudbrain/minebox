# Plan: Add BankAccount, Transaction, Transfer, Partner Models to Prisma Schema

## Context
Add 4 new models + 2 new enums to `prisma/schema.prisma`. The user provided the initial model definitions with `Int @id @default(autoincrement())`, but all IDs must be auto-generated strings (`String @id @default(cuid())`) to be consistent with the existing `Company` model pattern.

## Decisions
- **IDs**: All new model IDs → `String @id @default(cuid())` (BankAccount, Transaction, Transfer, Partner)
- **FK types**: `accountId` (Transaction) and `partnerId` (Transfer) also become `String` since the referenced model IDs are now String
- **Gender enum**: Replace the user's `Sex` enum with `Gender { M F }`
- **TransferType enum**: `MONEY_TRANSFER`, `GOLD_TRANSFER` (as specified)
- **TransactionType enum**: DEPOSIT, WITHDRAWAL, TRANSFER only (RECEIPT_OF_TRANSFER, LOAN_DISBURSEMENT, LOAN_PAYMENT removed per user request)
- **User back-relations**: Add `createdBankAccounts BankAccount[]` and `operatedTransactions Transaction[]` and `operatedTransfers Transfer[]` to User model
- **createdBy on BankAccount**: Optional (`User?`, `createdById String?`)
- **operator on Transaction/Transfer**: Required (`User`, `operatorId String`)

## Tasks

### 1. Add `Gender` enum
```prisma
enum Gender {
  M
  F
}
```

### 2. Add `TransactionType` enum
```prisma
enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
}
```

### 3. Add `TransferType` enum
```prisma
enum TransferType {
  MONEY_TRANSFER
  GOLD_TRANSFER
}
```

### 4. Add `BankAccount` model
```prisma
model BankAccount {
  id            String        @id @default(cuid())
  accountNumber String        @unique
  balance       Float
  avatar        String?
  firstName     String        @map("first_name")
  lastName      String        @map("last_name")
  surname       String?       @default("")
  gender        Gender
  phone         String        @unique
  otherPhone    String?       @default("")
  blocked       Boolean       @default(false)
  country       String?       @default("")
  province      String?       @default("")
  city          String?       @default("")
  address       String?       @default("")
  createdBy     User?         @relation("user_creator", fields: [createdById], references: [id])
  createdById   String?       @map("created_by_id")
  transactions  Transaction[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@map("bank_account")
}
```

### 5. Add `Transaction` model
```prisma
model Transaction {
  id           Int             @id @default(autoincrement())
```
→ **Change to:**
```prisma
model Transaction {
  id           String          @id @default(cuid())
  date         DateTime
  amount       Float
  goldQuantity String?         @default("")
  title        String?         @default("")
  message      String          @default("")
  type         TransactionType
  account      BankAccount     @relation(fields: [accountId], references: [id])
  accountId    String          @map("account_id")
  operator     User            @relation(fields: [operatorId], references: [id])
  operatorId   String          @map("operator_id")
  deleted      Boolean         @default(false)
  createdAt    DateTime         @default(now()) @map("created_at")
  updatedAt    DateTime         @updatedAt @map("updated_at")
}
```

### 6. Add `Partner` model
```prisma
model Partner {
  id        String    @id @default(cuid())
  code      String    @unique
  balance   Float
  transfers Transfer[]
  deleted   Boolean   @default(false)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
}
```

### 7. Add `Transfer` model
```prisma
model Transfer {
  id           Int          @id @default(autoincrement())
```
→ **Change to:**
```prisma
model Transfer {
  id           String       @id @default(cuid())
  date         DateTime
  type         TransferType
  amount       Float
  goldQuantity String?      @default("")
  sender       String
  message      String       @default("")
  partner      Partner      @relation(fields: [partnerId], references: [id])
  partnerId    String
  operator     User         @relation(fields: [operatorId], references: [id])
  operatorId   String
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
}
```

### 8. Update `User` model — add back-relations
Add these fields to the existing `User` model:
```prisma
  createdBankAccounts BankAccount[]  @relation("user_creator")
  operatedTransactions Transaction[]
  operatedTransfers Transfer[]
```

### 9. Validate
- Run `npx prisma validate` to check schema correctness
- Run `npx prisma format` to auto-format

## Risks / Notes
- If the DB already has data, a migration will be needed (`npx prisma migrate dev`) — not part of this plan, user should handle migration separately
- The `accountId` FK on Transaction changed from `Int` to `String` — any existing data would need migration
- The `partnerId` FK on Transfer changed from `Int` to `String` — same concern
