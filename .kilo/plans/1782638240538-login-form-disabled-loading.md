# Plan : Ajouter disabled au Form de LoginForm en fonction de loading

## Contexte
Dans `components/login/login-form.tsx`, le state `loading` est déjà utilisé pour afficher un spinner sur le bouton de soumission. Lors du chargement, les champs du formulaire restent interactifs, ce qui permet à l'utilisateur de modifier les valeurs pendant une requête en cours.

## Changement

### `components/login/login-form.tsx`

- **Ligne 40** : Ajouter `disabled={loading}` au composant `<Form>`.

```diff
- <Form layout="vertical" onFinish={onFinish}>
+ <Form layout="vertical" onFinish={onFinish} disabled={loading}>
```

La prop `disabled` d'Ant Design `Form` désactive simultanément tous les contrôles enfants (Input, Button, etc.), empêchant toute interaction pendant la soumission.

## Validation
- Vérifier que le composant compile sans erreur
- Tester : pendant le chargement, les champs email/mot de passe et le bouton doivent être désactivés
