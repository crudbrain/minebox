# Retirer le titre "Minebox" du formulaire de login

## Contexte
Le formulaire de login affiche un titre "Minebox" (`<Title level={3}>`) en haut de la carte de connexion. L'utilisateur souhaite le supprimer.

## Tâche
1. Dans `components/login/login-form.tsx`, ligne 56, supprimer la ligne :
   ```tsx
   <Title level={3} className="text-center">Minebox</Title>
   ```
2. Supprimer l'import inutilisé de `Title` dans la déstructuration `const { Title, Link } = Typography;` (ligne 7) — ne conserver que `Link`.

## Fichier modifié
- `components/login/login-form.tsx`

## Validation
- Vérifier visuellement que la carte de login s'affiche sans titre.
- Lancer le lint/typecheck pour confirmer l'absence d'erreurs.
