# Marquer l'admin comme emailVerified lors du setup

## Contexte
Quand le formulaire `/setup` est soumis, l'admin est créé via `auth.api.signUpEmail` puis `prisma.user.update` pour lui attribuer le rôle `"admin"`. Cependant, `emailVerified` reste `false` (valeur par défaut Prisma), car `signUpEmail` ne vérifie pas l'email automatiquement.

## Changement

### `app/api/company/route.ts` — ligne 67

Remplacer :
```ts
    await prisma.user.update({
      where: { id: userResult.user.id },
      data: { role: "admin" },
    });
```

Par :
```ts
    await prisma.user.update({
      where: { id: userResult.user.id },
      data: { role: "admin", emailVerified: true },
    });
```

## Justification
- L'admin créé lors du setup est le premier utilisateur du système — il n'y a pas de flux de vérification email à ce stade.
- Le champ `emailVerified` existe déjà sur le modèle `User` (`prisma/schema.prisma` ligne 40).
- L'appel `prisma.user.update` existe déjà et cible le bon utilisateur — il suffit d'ajouter un champ au `data`.

## Aucun autre changement
- Pas de migration Prisma nécessaire (le champ existe déjà).
- Pas de modification frontend.
