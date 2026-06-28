# Déplacer /ws/dashboard vers /ws via route group

## Objectif
Rendre la page dashboard accessible à `/ws` au lieu de `/ws/dashboard` en utilisant un route group Next.js `(dashboard)`.

## Étapes

1. **Renommer** le dossier `app/ws/dashboard/` → `app/ws/(dashboard)/`
   - Le fichier `app/ws/(dashboard)/page.tsx` sera servi à l'URL `/ws`
   - Le route group `(dashboard)` n'ajoute pas de segment d'URL

2. **Mettre à jour les références `/ws/dashboard` → `/ws`** dans :
   - `app/login/page.tsx` ligne 15 : `redirect("/ws/dashboard")` → `redirect("/ws")`
   - `components/login/login-form.tsx` ligne 29 : `router.push("/ws/dashboard")` → `router.push("/ws")`
   - `components/ws/sidebar.tsx` ligne 18 : `key: "/ws/dashboard"` → `key: "/ws"`
   - `components/ws/sidebar.tsx` ligne 20 : `<Link href="/ws/dashboard">` → `<Link href="/ws">`

## Validation
- Vérifier que `/ws` affiche le dashboard
- Vérifier que `/ws/dashboard` redirige ou retourne 404 (l'ancien chemin ne doit plus exister)
- Vérifier la navigation sidebar et les redirect après login
