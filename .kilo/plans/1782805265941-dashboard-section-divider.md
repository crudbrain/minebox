# Dashboard : Séparation verticale des sections de cards

## Contexte
Sur la page dashboard (`app/ws/(dashboard)/page.tsx`), les sections "Comptes" et "Partenaires" apparaissent sans séparation visuelle claire, ce qui les fait paraître collées.

## Plan d'implémentation

### Fichier à modifier : `app/ws/(dashboard)/page.tsx`

1. **Ajouter `Divider` à l'import Ant Design** (ligne 3) :
   - Remplacer `import { Card, Statistic } from "antd"` par `import { Card, Statistic, Divider } from "antd"`

2. **Retirer `mb-6` de la Card "Comptes"** (ligne 17) :
   - Remplacer `<Card title="Comptes" className="mb-6">` par `<Card title="Comptes">`

3. **Ajouter `<Divider />` entre les deux Cards** (entre lignes 47 et 49) :
   - Insérer `<Divider />` entre la fermeture de la Card "Comptes" et l'ouverture de la Card "Partenaires"

## Résultat attendu
Une ligne horizontale de séparation claire entre les sections "Comptes" et "Partenaires" du dashboard.
