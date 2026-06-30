# Réduire la largeur des formulaires /setup et /login

## Contexte
Les formulaires `/setup` et `/login` ont des cartes trop larges pour un design centré élégant.

## Changements

### 1. Setup form (`components/setup/setup-form.tsx`)
- Ligne 54 : remplacer `max-w-2xl` par `max-w-lg`
- Garder la layout colonne unique (pas de grille 2 colonnes)

### 2. Login form (`components/login/login-form.tsx`)
- Ligne 38 : remplacer `max-w-md` par `max-w-sm`

## Validation
- Vérifier visuellement que les deux formulaires ont un aspect compact et centré
- Lancer le lint/typecheck
