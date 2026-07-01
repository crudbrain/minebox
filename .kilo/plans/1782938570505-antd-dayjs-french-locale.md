# Plan : Configurer Ant Design et dayjs en français

## Contexte
`components/providers.tsx` contient déjà un `<ConfigProvider theme={theme}>` mais sans prop `locale`. dayjs est importé dans 2 fichiers sans locale configurée.

## Tâches

### 1. `components/providers.tsx` — Ajouter locale fr sur ConfigProvider
- Ajouter l'import : `import frFR from 'antd/es/locale/fr_FR';`
- Ajouter la prop `locale={frFR}` sur `<ConfigProvider>` :
  ```tsx
  <ConfigProvider theme={theme} locale={frFR}>
  ```

### 2. `components/providers.tsx` — Configurer dayjs en français
- Ajouter les imports :
  ```tsx
  import dayjs from 'dayjs';
  import 'dayjs/locale/fr';
  ```
- Appeler `dayjs.locale('fr');` au niveau module (avant le composant Providers)

### 3. Pas de changement dans les fichiers consommateurs
- `bank-account-transactions.tsx` et `partner-transfers.tsx` importent déjà `dayjs` — ils hériteront automatiquement de la locale fr (dayjs est un singleton).

## Validation
- Vérifier que `npm run build` passe sans erreur
- DatePicker, pagination de Table, etc. doivent afficher en français
- Les dates dayjs doivent utiliser les noms de mois/jours français
