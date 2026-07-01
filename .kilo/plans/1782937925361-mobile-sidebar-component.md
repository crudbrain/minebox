# Plan: Extraire MobileSidebarDrawer — supprimer la duplication dans le sidebar

## Contexte
`components/ws/sidebar.tsx` mélange logique desktop et mobile dans un seul composant. Le mode mobile (Drawer) duplique le header logo/nom dans le `title` du Drawer ET dans `sidebarContent`. Le `sidebarContent` inclut aussi le bouton collapse (desktop-only) qui n'a pas sa place en mobile.

## Décisions
- **Header du Drawer** : Le Drawer mobile garde son propre `title` avec logo/nom (sticky nativement)
- **Périmètre** : Le composant extrait ne gère que le Drawer, pas le header hamburger de `WorkspaceShell`

## Étapes

### 1. Créer `SidebarContent` dans `components/ws/sidebar-content.tsx`
- Props : `menuItems`, `activeKey`, `onMenuClick`, `collapsed` (pour UserDropdown)
- Contenu : Menu + UserDropdown (uniquement la partie partagée)
- Ne contient PAS le header avec logo/nom ni le bouton collapse

### 2. Créer `MobileSidebarDrawer` dans `components/ws/mobile-sidebar-drawer.tsx`
- Props : `open`, `onClose`, `menuItems`, `activeKey`, `onMenuClick`, `company`
- Rendu : `<Drawer>` avec `title` contenant logo/nom entreprise, et `SidebarContent` dans le body
- Utilise `useCompany()` si `company` non fourni

### 3. Refactorer `components/ws/sidebar.tsx`
- Importer `SidebarContent` et `MobileSidebarDrawer`
- Desktop : `<Sider>` avec header logo/collapse + `<SidebarContent>`
- Mobile : `<MobileSidebarDrawer>` (remplace le Drawer inline)
- Supprimer l'ancien `sidebarContent` qui mélangeait tout

### 4. Vérifier `workspace-shell.tsx`
- Aucun changement nécessaire (header hamburger reste en place, props du Sidebar inchangées)

## Risques
- Les props du Sidebar restent identiques → pas de breaking change pour `WorkspaceShell`
- Le comportement visuel doit rester identique après refactor

## Validation
- Vérifier que le Drawer mobile affiche bien le logo/nom dans le title et le menu en dessous
- Vérifier que le sidebar desktop a toujours le collapse button et le header
- Vérifier que `workspace-shell.tsx` compile sans erreur
