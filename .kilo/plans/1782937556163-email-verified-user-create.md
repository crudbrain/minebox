# emailVerified=true lors de la création d'utilisateur depuis les settings

## Contexte
Quand un admin crée un utilisateur depuis la page Settings > Users, `emailVerified` reste `false` (défaut Prisma). L'admin crée l'utilisateur manuellement, donc l'email doit être considéré comme vérifié.

## Analyse
- `authClient.admin.createUser()` (better-auth admin plugin) accepte un champ `data: Record<string, any>` qui est spread dans les données utilisateur lors de la création (`routes.mjs:191-196`).
- Le champ `data` permet de passer `emailVerified: true` sans modification côté serveur.

## Changement requis

### `components/settings/user-create-drawer.tsx` (ligne 73-78)
Ajouter `data: { emailVerified: true }` à l'appel `authClient.admin.createUser` :

```diff
 await authClient.admin.createUser({
   name: values.name,
   email: values.email,
   password: values.password,
   role: values.role as "admin" | "user",
+  data: { emailVerified: true },
 });
```

## Validation
- Créer un utilisateur depuis Settings > Users
- Vérifier dans la table que la colonne "Vérifié" affiche "Oui" pour le nouvel utilisateur
