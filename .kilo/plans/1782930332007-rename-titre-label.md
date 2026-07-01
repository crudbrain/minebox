# Plan : Renommer le label "Titre" en "Intitulé"

## Contexte
Le formulaire de transaction bancaire utilise le label "Titre" pour le champ title. Il doit être renommé en "Intitulé" pour un vocabulaire plus adapté.

## Tâches

1. **`components/bank-accounts/bank-account-transactions.tsx:404`** — Remplacer `label="Titre"` par `label="Intitulé"`

## Validation
- Vérifier que le fichier est modifié correctement
- Lancer le typecheck du projet
