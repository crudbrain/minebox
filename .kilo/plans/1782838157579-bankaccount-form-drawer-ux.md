# Plan : Ameliorer UX formulaire BankAccount — Modal vers Drawer

## Contexte

Le formulaire BankAccount actuel (`bank-account-form-modal.tsx`) contient 12 champs affiches en colonne verticale dans un Modal. C'est trop long pour un Modal. Le projet utilise deja des Drawers pour les formulaires longs (company-edit-drawer, user-create-drawer, user-edit-drawer).

## Decisions

- **Scope** : BankAccount uniquement. Le formulaire Partner (2 champs) reste en Modal.
- **Approche** : Convertir le Modal en Drawer, meme composant pour creation et edition.
- **Groupement** : 3 sections avec `Card` Ant Design — Identite, Contact, Adresse.

## Changements

### 1. Renommer et convertir `bank-account-form-modal.tsx` en `bank-account-form-drawer.tsx`

Remplacer le composant `Modal` par un `Drawer` en suivant le pattern de `company-edit-drawer.tsx` :

- **Props** : `open`, `onClose`, `bankAccount?` (inchangé)
- **Drawer width** : `isMobile ? "100vw" : 520` (même convention)
- **Footer** : boutons Annuler + Enregistrer/Créer dans le footer du Drawer (pattern existant)
- **Form** : `layout="vertical"`, `onFinish=handleSubmit`, `clearOnDestroy`, `destroyOnHidden`
- **Titre** : "Modifier le compte" / "Nouveau compte"

### 2. Grouper les champs en 3 sections Card

Utiliser `<Card>` avec `title` et `size="small"` pour chaque groupe :

| Section | Champs |
|---------|--------|
| **Identite** | accountNumber (disabled en edit), lastName, surname, firstName, gender, blocked (Switch) |
| **Contact** | phone, otherPhone |
| **Adresse** | country, province, city, address |

Card usage : `<Card title="Identite" size="small" style={{ marginBottom: 16 }}>` — style cohérent avec la "Zone danger" existante dans `bank-account-detail.tsx`.

### 3. Mettre a jour les imports

Fichiers qui importent `BankAccountFormModal` :

- `components/bank-accounts/bank-account-detail.tsx` ligne 11 → changer l'import et le nom du composant
- Tout autre fichier qui reference `BankAccountFormModal` (recherche et mettre a jour)

### 4. Supprimer l'ancien fichier

Supprimer `components/bank-accounts/bank-account-form-modal.tsx` apres migration.

## Risques

- **Recherche d'autres usages** : verifier tous les imports de `BankAccountFormModal` avant suppression
- **Comportement mobile** : le Drawer en `100vw` sur mobile fonctionne deja dans le projet

## Validation

- [ ] Le Drawer s'ouvre en creation avec numero genere automatiquement
- [ ] Le Drawer s'ouvre en edition avec les valeurs pre-remplies
- [ ] Les 3 sections Card s'affichent correctement (desktop + mobile)
- [ ] Le formulaire valide et soumet correctement (creation + edition)
- [ ] Aucun import cassé vers l'ancien composant
- [ ] Lint/typecheck passent
