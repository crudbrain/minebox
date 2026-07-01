# Fix: Sidebar scroll indépendant + PageHeader sticky

## Problème
Quand les pages sous le layout ws sont longues, le scroll se propage au layout parent Ant Design `<Layout>`, entraînant le sidebar avec le contenu. Le sidebar doit rester fixe, et seules les pages doivent scroller. De plus, `PageHeader` doit être sticky dans la zone de scroll.

## Changements requis

### 1. `components/ws/workspace-shell.tsx`
- Remplacer `className="min-h-screen"` sur le `<Layout>` racine par `className="h-screen overflow-hidden"` — fixe la hauteur au viewport et empêche le scroll global.
- Sur le `<Layout>` interne (celui qui contient le mobile header + Content), ajouter `className="h-full overflow-hidden"`.
- Sur le `<Content>`, ajouter `className="... overflow-y-auto h-full"` — confine le scroll à la zone de contenu uniquement.

### 2. `components/shared/page-header.tsx`
- Ajouter `sticky top-0 z-10 bg-layout` (ou `bg-inherit`) au div racine pour que le header reste visible lors du scroll dans le Content.

### 3. `components/ws/sidebar.tsx`
- Le `<Sider>` a déjà `className="h-screen"`. Vérifier qu'il a `overflow="hidden"` ou `overflow-hidden` pour empêcher tout scroll parasite dans le sidebar. Ajouter `overflow-hidden` sur le Sider si absent.

## Validation
- Ouvrir une page longue (ex: settings/users avec beaucoup d'utilisateurs) et vérifier :
  1. Le sidebar ne scrolle pas quand on scrolle le contenu.
  2. Le PageHeader reste visible (sticky) en haut de la zone de contenu.
  3. Le contenu sous le PageHeader défile normalement.
  4. En mobile, le comportement reste correct (drawer + mobile header).
