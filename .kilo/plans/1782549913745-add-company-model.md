# Plan : Ajout du modèle Company au schéma Prisma

## Contexte
Ajouter un modèle `Company` (singleton applicatif) et deux enums (`Status`, `IsoCodeCurrency`) au schéma Prisma existant.

## Décisions
- **ID** : `String @id @default(cuid())` — cohérent avec User, Session, Account
- **Singleton** : table normale, unicité gérée côté applicatif (1 seul enregistrement)
- **Relations** : aucune (modèle isolé)
- **Mapping** : `@@map("company")` — cohérent avec le schéma existant

## Étapes

### 1. Ajouter les enums à `prisma/schema.prisma`
Ajouter après le bloc `datasource db` (ou en fin de fichier) :
```prisma
enum Status {
  ENABLED
  DISABLED
}

enum IsoCodeCurrency {
  USD
  CDF
}
```

### 2. Ajouter le modèle Company à `prisma/schema.prisma`
```prisma
model Company {
  id          String           @id @default(cuid())
  code        String           @unique
  name        String
  shortName   String?          @default("")
  description String?          @default("")
  logo        String?          @default("")
  icon        String?          @default("")
  currency    IsoCodeCurrency
  country     String?          @default("")
  province    String?          @default("")
  city        String?          @default("")
  address     String?          @default("")
  webSiteUrl  String?          @default("") @map("web_site_url")
  motto       String?          @default("")
  phone1      String?          @default("")
  phone2      String?          @default("")
  email       String?          @default("")
  status      Status
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  @@map("company")
}
```

### 3. Valider
- Lancer `npx prisma generate` pour vérifier la génération du client
- Lancer `npx prisma migrate dev --name add-company` pour créer la migration et valider le DDL

## Risques / Remarques
- Le singleton (1 seule company) est garanti côté applicatif, pas par contrainte DB
- `webSiteUrl` est mappé en DB vers `web_site_url` via `@map`
