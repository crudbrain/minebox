# Plan: Clarifier le label "Nom de l'entreprise" dans les formulaires

## Contexte
Dans le formulaire `/setup` et le drawer de modification d'entreprise, le champ `name` (nom de l'entreprise) utilise le label "Nom", ce qui prête à confusion avec le nom de l'utilisateur/administrateur qui porte aussi le label "Nom".

## Changements

### 1. `components/setup/setup-form.tsx`
- Ligne 136: changer `label="Nom"` → `label="Nom de l'entreprise"` (champ `name`, section entreprise)
- Ligne 138: changer le message de validation `"Nom requis"` → `"Nom de l'entreprise requis"`
- Le champ `adminName` (ligne 217) garde `label="Nom"` — c'est le nom de la personne, pas de confusion

### 2. `components/settings/company-edit-drawer.tsx`
- Ligne 91: changer `label="Nom"` → `label="Nom de l'entreprise"` (champ `name`)

## Validation
- Vérifier visuellement que les deux formulaires affichent bien "Nom de l'entreprise"
- Vérifier qu'il n'y a pas d'autres formulaires company avec le même problème
