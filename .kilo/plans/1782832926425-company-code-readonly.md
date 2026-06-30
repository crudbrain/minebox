# Rendre le champ Code non modifiable dans le formulaire d'édition de company

## Contexte
Dans les settings, le formulaire de modification de company (drawer) permet actuellement de modifier le champ `code`, ce qui ne doit pas être possible.

## Changement
- **Fichier** : `components/settings/company-edit-drawer.tsx`, ligne 89
- **Action** : Remplacer `<Input />` par `<Input disabled />` sur le Form.Item `code`
- **Effet** : Le code de l'entreprise sera affiché en gris et non modifiable dans le drawer d'édition des settings

## Validation
- Ouvrir le drawer de modification de company dans /ws/settings
- Vérifier que le champ Code est grisé et ne peut pas être édité
- Vérifier que les autres champs restent modifiables normalement
