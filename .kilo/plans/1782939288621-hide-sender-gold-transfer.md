# Masquer le champ "Expéditeur" pour l'expédition de l'or (GOLD_TRANSFER)

## Contexte
Le champ "Expéditeur" (`sender`) est actuellement obligatoire pour tous les types de transferts. Pour l'expédition de l'or (`GOLD_TRANSFER`), ce champ n'est pas pertinent et doit être masqué du formulaire et des détails.

## Tâches

### 1. `components/partners/partner-transfers.tsx` — Masquer le champ formulaire
- Encadrer le `Form.Item` "Expéditeur" (lignes 356-362) avec un conditionnel `{transferType !== "GOLD_TRANSFER" && (...)}`
- `transferType` est déjà surveillé via `Form.useWatch("type", form)` (ligne 34)

### 2. `components/partners/transfer-detail-drawer.tsx` — Masquer dans les détails
- Conditionner le `Descriptions.Item` "Expéditeur" (lignes 112-114) avec `{transfer.type !== "GOLD_TRANSFER" && (...)}`

### 3. `lib/schemas/transfer.ts` — Rendre sender optionnel
- Dans `transferCreateSchema`, changer `sender: z.string().min(1, "Expéditeur requis")` en `sender: z.string().optional()`
- `transferUpdateSchema` a déjà `sender: z.string().optional()` — aucun changement

### 4. `components/partners/partner-transfers.tsx` — Tableau et impression
- La colonne "Expéditeur" affiche déjà la valeur brute ; quand `sender` sera `undefined`, elle affichera une cellule vide. Ajuster le render pour afficher "-" si absent : `render: (v: string) => v || "-"`

## Fichiers modifiés
- `components/partners/partner-transfers.tsx`
- `components/partners/transfer-detail-drawer.tsx`
- `lib/schemas/transfer.ts`

## Validation
- Créer un transfert GOLD_TRANSFER : le champ Expéditeur ne doit pas apparaître
- Créer un transfert MONEY_TRANSFER : le champ Expéditeur doit apparaître (optionnel)
- Ouvrir les détails d'un GOLD_TRANSFER : Expéditeur ne doit pas apparaître
- La colonne tableau affiche "-" pour les transfers sans sender
