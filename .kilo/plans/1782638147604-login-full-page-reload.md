# Plan : Remplacer router.push par full page reload sur /login

## Contexte
Après une connexion réussie sur la page `/login`, l'application utilise `router.push("/ws")` (navigation client-side Next.js). Il faut à la place actualiser toute la page pour garantir un état serveur frais (session, cookies, etc.).

## Changements

### 1. `components/login/login-form.tsx`

- **Ligne 29** : Remplacer `router.push("/ws")` par `window.location.href = "/ws"`
- **Ligne 4** : Supprimer l'import `useRouter` de `next/navigation`
- **Ligne 15** : Supprimer la déclaration `const router = useRouter();`

## Validation
- Vérifier que le composant compile sans erreur après suppression de `useRouter`
- Tester le flow de login : après connexion, la page doit se recharger entièrement et naviguer vers `/ws`
