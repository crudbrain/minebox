# Auto-générer le code entreprise côté serveur

## Contexte
Le champ `code` sur le formulaire `/setup` doit être supprimé et auto-généré côté serveur avec le format `CMP-YY00001` (préfixe CMP + année 2 chiffres + suffixe séquentiel 5 chiffres), sur le même pattern que `generate-account-number`.

## Changements

### 1. Créer `app/api/company/generate-code/route.ts`
- Endpoint GET qui génère un code unique au format `CMP-YY00001`
- Logique identique à `app/api/bank-accounts/generate-account-number/route.ts` :
  - Prefix = `CMP-` + 2 derniers chiffres de l'année courante
  - Cherche les codes existants commençant par ce prefix
  - Calcule le suffixe séquentiel suivant (5 chiffres padStart)
  - Vérifie l'unicité avec `findUnique`
  - Retourne `{ code: "CMP-26000001" }`
- Pas d'auth requise (setup = avant premier user)

### 2. Modifier `app/setup/page.tsx`
- Appeler `fetch` vers `/api/company/generate-code` côté serveur (dans le composant `async`)
- Passer le code généré au composant `<SetupForm code={generatedCode} />`

### 3. Modifier `components/setup/setup-form.tsx`
- Ajouter la prop `code: string`
- Supprimer le `Form.Item` pour le champ `code` (lignes 65-71)
- Dans `onFinish`, inclure `code` dans le payload `company` : `code: code` (depuis la prop, pas depuis les valeurs du formulaire)

### 4. Modifier `lib/schemas/company.ts`
- Retirer `code` de `companyCreateSchema` (le code n'est plus fourni par le client)
- Garder `code` dans `companyUpdateSchema` (il peut encore être modifié depuis les settings)

### 5. Modifier `app/api/company/route.ts` (handler POST)
- Avant `prisma.company.create`, si `parsed.data` n'a pas de `code`, appeler la même logique de génération de code (ou faire un fetch interne vers `/api/company/generate-code`)
- Alternative plus propre : extraire la logique de génération dans une fonction utilitaire `generateCompanyCode()` dans `lib/api/company.ts` et l'appeler depuis le handler POST et l'endpoint generate-code
- Ajouter le `code` généré au `data` passé à `prisma.company.create`

## Fichiers affectés
- `app/api/company/generate-code/route.ts` (nouveau)
- `app/setup/page.tsx`
- `components/setup/setup-form.tsx`
- `lib/schemas/company.ts`
- `app/api/company/route.ts`
- `lib/api/company.ts` (ajout fonction utilitaire `generateCompanyCode`)

## Validation
- `npx tsc --noEmit` sans erreurs
- `npm run lint` sans erreurs
- Vérifier que le setup fonctionne : le code est auto-généré, le champ n'apparaît plus dans le formulaire
