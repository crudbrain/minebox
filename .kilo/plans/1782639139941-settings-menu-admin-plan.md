# Plan : Menu Paramètres dans le layout WS

## Contexte
- Le plugin `admin()` better-auth est déjà configuré (serveur + client)
- Les endpoints admin better-auth sont auto-disponibles via `/api/auth/admin/*`
- Le modèle `User` a déjà les champs `role`, `banned`, `banReason`, `banExpires`
- `companyUpdateSchema` existe déjà dans `lib/schemas/company.ts`
- L'API company n'a que GET et POST (pas de PUT/PATCH)

## Décisions
- Sous-navigation : **Tabs horizontaux** (Company | Utilisateurs)
- Modification company : **Drawer** Ant Design
- Actions utilisateurs : **Complet** (CRUD, ban/unban, sessions, rôle, impersonate)
- Protection admin : **Server-side** dans le layout settings

## Tâches ordonnées

### 1. Sidebar : ajouter menu "Paramètres" (admin only)
- **Fichier** : `components/ws/sidebar.tsx`
- Ajouter `SettingOutlined` depuis `@ant-design/icons`
- Ajouter item menu `Paramètres` avec key `/ws/settings`
- **Conditionner l'affichage** : le menu Paramètres n'est visible que si `session.user.role === "admin"`
- Rendre le composant Sidebar conscient du rôle utilisateur (passer `role` depuis le layout ws ou via le hook session)
- Le layout ws (`app/ws/layout.tsx`) passe déjà `company` au `WorkspaceShell` → ajouter passage de `session.user.role`

### 2. Layout settings : protection admin server-side
- **Nouveau fichier** : `app/ws/settings/layout.tsx`
- Server component qui :
  - Appelle `auth.api.getSession({ headers: await headers() })`
  - Vérifie `session.user.role === "admin"` (ou via `auth.api.userHasPermission`)
  - Si non-admin → `redirect("/ws")` ou page 403
  - Rend les enfants avec sous-navigation horizontale (Tabs Ant Design) :
    - Tab "Company" → lien vers `/ws/settings`
    - Tab "Utilisateurs" → lien vers `/ws/settings/users`
  - Utiliser `usePathname` côté client pour le tab actif → séparer en layout server + composant client si nécessaire

### 3. Page company (settings index)
- **Nouveau fichier** : `app/ws/settings/page.tsx`
- Client component
- Affiche les informations de la company en lecture seule (Descriptions Ant Design)
- Bouton "Modifier" qui ouvre un Drawer
- Le Drawer contient un formulaire d'édition basé sur `companyUpdateSchema`
- Hook `useCompany` pour fetch les données
- Sur submit : appel PUT `/api/company` puis invalidation query

### 4. API company : ajouter endpoint PUT
- **Fichier** : `app/api/company/route.ts`
- Ajouter fonction `PUT` qui :
  - Valide le body avec `companyUpdateSchema`
  - Vérifie que l'utilisateur est admin (session + role check)
  - Met à jour la company avec `prisma.company.update()`
  - Retourne la company mise à jour

### 5. Page gestion utilisateurs
- **Nouveau fichier** : `app/ws/settings/users/page.tsx`
- Client component avec Table Ant Design
- Utilise `authClient.admin.listUsers()` pour lister les utilisateurs avec pagination server-side
- Colonnes : Nom, Email, Rôle, Vérifié, Banni, Créé le
- **Actions par ligne** (Dropdown menu) :
  - Modifier (ouvre Drawer/Modal avec formulaire utilisant `authClient.admin.updateUser()`)
  - Changer le rôle (`authClient.admin.setRole()`)
  - Définir mot de passe (`authClient.admin.setUserPassword()`)
  - Bannir (`authClient.admin.banUser()`) avec raison + durée
  - Débannir (`authClient.admin.unbanUser()`)
  - Voir sessions (`authClient.admin.listUserSessions()`)
  - Révoquer toutes les sessions (`authClient.admin.revokeUserSessions()`)
  - Impersonifier (`authClient.admin.impersonateUser()`)
  - Supprimer (`authClient.admin.removeUser()`) avec confirmation
- **Bouton "Créer un utilisateur"** en haut de page :
  - Ouvre un Drawer/Modal avec formulaire (nom, email, mot de passe, rôle)
  - Utilise `authClient.admin.createUser()`

### 6. Composant Drawer modification company
- **Nouveau fichier** : `components/settings/company-edit-drawer.tsx`
- Drawer Ant Design avec formulaire (Form Ant Design)
- Champs basés sur `companyUpdateSchema` : name, shortName, description, logo, icon, currency, country, province, city, address, webSiteUrl, motto, phone1, phone2, email, status
- Appel PUT `/api/company` sur submit

### 7. Composant Drawer création utilisateur
- **Nouveau fichier** : `components/settings/user-create-drawer.tsx`
- Drawer avec formulaire : name, email, password, role (select)
- Utilise `authClient.admin.createUser()`

### 8. Composant Drawer modification utilisateur
- **Nouveau fichier** : `components/settings/user-edit-drawer.tsx`
- Drawer avec formulaire : name, email
- Utilise `authClient.admin.updateUser()`

## Fichiers à créer
1. `app/ws/settings/layout.tsx` — Layout settings avec protection admin + tabs
2. `app/ws/settings/page.tsx` — Page infos company
3. `app/ws/settings/users/page.tsx` — Page gestion utilisateurs
4. `components/settings/company-edit-drawer.tsx` — Drawer édition company
5. `components/settings/user-create-drawer.tsx` — Drawer création utilisateur
6. `components/settings/user-edit-drawer.tsx` — Drawer modification utilisateur

## Fichiers à modifier
1. `components/ws/sidebar.tsx` — Ajouter menu Paramètres (admin only)
2. `app/api/company/route.ts` — Ajouter PUT endpoint
3. `app/ws/layout.tsx` — Passer le rôle utilisateur au shell/sidebar

## Risques / Points d'attention
- Les appels `authClient.admin.*` nécessitent que l'utilisateur connecté soit admin (better-auth le vérifie côté serveur automatiquement)
- L'impersonification doit être gérée avec soin (redirection après impersonate)
- Le premier utilisateur créé lors du setup doit avoir le rôle `admin` — vérifier que c'est le cas dans le setup actuel
