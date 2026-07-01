# Plan : Padding horizontal login/setup pour petits écrans

## Problème
Sur les petits écrans, les formulaires des pages `/login` et `/setup` collent aux bords car aucun padding horizontal n'est appliqué sur le conteneur wrapper.

## Changements

### 1. `components/login/login-form.tsx` — ligne 54
- **Avant** : `className="min-h-screen flex items-center justify-center bg-layout"`
- **Après** : `className="min-h-screen flex items-center justify-center bg-layout px-4"`

### 2. `components/setup/setup-form.tsx` — ligne 125
- **Avant** : `className="min-h-screen flex items-center justify-center bg-layout py-8"`
- **Après** : `className="min-h-screen flex items-center justify-center bg-layout px-4 py-8"`

## Validation
- Ouvrir `/login` et `/setup` sur un écran < 400px de large et vérifier que la Card ne touche plus les bords (16px d'espace de chaque côté).
