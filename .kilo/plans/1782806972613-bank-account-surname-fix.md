# Bank Account: Inclure surname dans "Nom complet" + rendre surname obligatoire dans le formulaire

## Contexte
- La colonne "Nom complet" du tableau (`bank-account-table.tsx`) affiche seulement `firstName + lastName`, ignorant `surname`
- Le champ "Surnom" du formulaire (`bank-account-form-modal.tsx`) n'est pas marqué comme obligatoire malgré le besoin métier
- Le schema Prisma garde `surname` comme `String?` (optionnel en DB), mais le formulaire doit l'exiger

## Tâches

### 1. `components/bank-accounts/bank-account-table.tsx`
- Ajouter `surname: string` à l'interface `BankAccountRecord` (ligne 12-20)
- Modifier le render de la colonne "Nom complet" (ligne 53-54) pour afficher `firstName lastName surname`, en filtrant les valeurs vides de surname :
  ```
  [record.firstName, record.lastName, record.surname].filter(Boolean).join(" ")
  ```

### 2. `components/bank-accounts/bank-account-form-modal.tsx`
- Ajouter `rules={[{ required: true, message: "Surnom requis" }]}` sur le Form.Item surname (ligne 99)
- Antd affichera automatiquement l'astérisque rouge sur le label quand `required: true` est présent dans les rules

## Notes
- Aucune modification du schema Prisma — `surname` reste optionnel en DB
- La validation `required` est uniquement au niveau du formulaire Antd
