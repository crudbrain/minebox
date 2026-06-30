# UX Setup & Login Forms — Improvements

## Context
- `components/setup/setup-form.tsx` : 14 champs entreprise + 4 admin, un seul bloc, validation Ant Design partielle vs schémas Zod
- `components/login/login-form.tsx` : login simple, erreurs vagues
- Schémas Zod de référence : `lib/schemas/setup.ts`, `lib/schemas/company.ts`

## Changes

### 1. Setup Form — Validation Ant Design synchronisée avec Zod

**File**: `components/setup/setup-form.tsx`

- `adminPassword` : ajouter `rules` avec `{ min: 6, message: "Mot de passe minimum 6 caractères" }` (actuellement seul `required` est présent, le schéma Zod impose `min(6)`)
- `email` entreprise (champ `email` ligne 115) : ajouter `rules` avec `{ type: "email", message: "Email invalide" }` (le schéma Zod `company.ts:18` impose `z.string().email()`)
- `webSiteUrl` : ajouter `rules` avec `{ type: "url", message: "URL invalide" }`

### 2. Setup Form — Indicateur de force du mot de passe

**File**: `components/setup/setup-form.tsx`

- Ajouter un composant `PasswordStrength` sous le champ `adminPassword`
- Critères : longueur >= 6, contient majuscule, contient minuscule, contient chiffre, contient caractère spécial
- Affichage : barre de progression (rouge → orange → vert) + texte descriptif
- Utiliser `Form.Item` `dependencies` sur `adminConfirmPassword` pour re-valider quand le mot de passe change

### 3. Setup Form — Erreurs serveur détaillées

**File**: `components/setup/setup-form.tsx`

- Dans le `catch` de `onFinish`, parser la réponse d'erreur serveur
- Si la réponse contient `details` (format `z.flattenError`), afficher les erreurs champ par champ via `form.setFields()` ou `message.error` détaillé
- Si la réponse contient `error` simple, afficher ce message
- Fallback : "Échec de la configuration"

**File**: `lib/api/company.ts` — `createCompany`

- Modifier pour lancer une erreur contenant les détails serveur au lieu d'un `Error` générique

### 4. Setup Form — Sections visuelles avec Divider

**File**: `components/setup/setup-form.tsx`

Remplacer les `Title level={5}` par des sections visuelles :

- `Divider` "Informations de l'entreprise" — champs : name, shortName, description, currency
- `Divider` "Localisation" — champs : country, province, city, address
- `Divider` "Contact & Divers" — champs : webSiteUrl, motto, phone1, phone2, email, logo, icon
- `Divider` "Administrateur" — champs : adminName, adminEmail, adminPassword, adminConfirmPassword

Utiliser `Divider` d'Ant Design avec `orientation="left"`.

### 5. Setup Form — Champs logo/icône améliorés

**File**: `components/setup/setup-form.tsx`

- `logo` : ajouter `placeholder="URL du logo (https://...)"` + règle `{ type: "url", message: "URL invalide" }`
- `icon` : ajouter `placeholder="URL de l'icône (https://...)"` + règle `{ type: "url", message: "URL invalide" }`

### 6. Login Form — Messages d'erreur spécifiques

**File**: `components/login/login-form.tsx`

- Analyser `result.error` de better-auth pour afficher des messages différenciés :
  - Code/token lié à "Invalid email or password" → "Email ou mot de passe incorrect"
  - Code lié à account not found → "Aucun compte trouvé avec cet email"
  - Autres erreurs → afficher `result.error.message` si disponible, sinon "Échec de la connexion"

### 7. Protection double-submit (commun)

**File**: `components/setup/setup-form.tsx`, `components/login/login-form.tsx`

- Le bouton submit est déjà `disabled={loading}`, mais ajouter un guard au début de `onFinish` :
  ```
  if (loading) return;
  ```
- Cela empêche tout double-submit entre le clic et le `setLoading(true)` asynchrone

## Out of Scope
- Pas de stepper/wizard sur le formulaire setup
- Pas de lien "Mot de passe oublié"
- `window.location.reload()` conservé (pas de `router.push`)
- Pas de modification des schémas Zod existants
