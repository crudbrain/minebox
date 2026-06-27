# Plan : Intégration du plugin admin better-auth

## Objectif
Configurer le plugin admin de better-auth côté serveur et client, et migrer la base de données. Aucune UI admin n'est incluse.

## Étapes

### 1. Modifier `lib/auth.ts` — ajouter le plugin serveur
- Importer `admin` depuis `better-auth/plugins`
- Ajouter `admin()` au tableau `plugins` de `betterAuth()`

### 2. Modifier `lib/auth-client.ts` — ajouter le plugin client
- Importer `adminClient` depuis `better-auth/client/plugins`
- Ajouter `adminClient()` au tableau `plugins` de `createAuthClient()`

### 3. Mettre à jour `prisma/schema.prisma` — ajouter les champs admin
Modèle `User` — ajouter :
- `role String @default("user")`
- `banned Boolean @default(false)`
- `banReason String?`
- `banExpires DateTime?`

Modèle `Session` — ajouter :
- `impersonatedBy String?`

### 4. Migrer la base de données
Exécuter `npx auth migrate` pour appliquer les changements de schéma.

## Fichiers modifiés
- `lib/auth.ts`
- `lib/auth-client.ts`
- `prisma/schema.prisma`

## Risque
- La commande `npx auth migrate` modifie la DB directement. Sauvegarder la DB avant si nécessaire.
- Les champs ajoutés ont des valeurs par défaut, donc les données existantes ne seront pas cassées.
