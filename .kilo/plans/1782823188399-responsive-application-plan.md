# Plan: Rendre l'application Minebox responsive

## Contexte
L'application Minebox utilise Next.js 16 + Ant Design 6 + Tailwind CSS 4. Actuellement, l'UI est conçue uniquement pour desktop. Le sidebar est permanent, les tables débordent, les Descriptions utilisent `column={2}` fixe, les Drawers ont des largeurs fixes, et les barres d'actions ne s'adaptent pas aux petits écrans.

## Décisions
- **Sidebar mobile** : Drawer overlay (s'ouvre via bouton hamburger, se ferme en cliquant dehors ou sur un lien)
- **Breakpoint mobile** : `768px` (md) — correspond au breakpoint `md` de Tailwind et au `screenMd` d'Ant Design

## Tâches ordonnées

### 1. Sidebar responsive — `components/ws/sidebar.tsx`
- Ajouter un hook `useWindowSize` ou `useMediaQuery` (ou utiliser `Grid.useBreakpoint` d'Ant Design) pour détecter `<768px`
- En mode mobile (`<768px`) :
  - Le `Sider` est masqué ; un bouton hamburger flottant (position fixed, top-left) permet d'ouvrir le sidebar
  - Le sidebar s'affiche dans un `<Drawer>` Ant Design (placement="left", sans masquer le fond)
  - Cliquer sur un item de menu ou en dehors ferme le Drawer
- En mode desktop (`>=768px`) : comportement actuel inchangé
- Ajouter un callback `onMenuClick` optionnel pour fermer le Drawer après navigation

### 2. WorkspaceShell responsive — `components/ws/workspace-shell.tsx`
- Ajouter un bandeau/header mobile (visible uniquement `<768px`) avec :
  - Bouton hamburger à gauche
  - Nom court de l'entreprise au centre
  - UserDropdown à droite (version compacte)
- `Content` : réduire le padding de `p-6` à `p-3` en mobile (`p-3 md:p-6`)
- Passer le contrôle d'ouverture du Drawer au niveau du shell pour coordination hamburger/sidebar

### 3. Tables responsive — tous les composants Table
- `components/bank-accounts/bank-account-table.tsx` : ajouter `scroll={{ x: 800 }}` au Table
- `components/partners/partner-table.tsx` : ajouter `scroll={{ x: 600 }}`
- `components/bank-accounts/bank-account-transactions.tsx` : ajouter `scroll={{ x: 900 }}`
- `components/partners/partner-transfers.tsx` : ajouter `scroll={{ x: 900 }}`
- `app/ws/settings/users/page.tsx` : ajouter `scroll={{ x: 800 }}`

### 4. Descriptions responsive — tous les composants Descriptions
- `components/bank-accounts/bank-account-detail.tsx` : `column={2}` → responsive (1 en mobile, 2 en desktop). Utiliser le hook breakpoint Ant Design pour passer `column` dynamiquement.
- `components/partners/partner-detail.tsx` : même approche
- `app/ws/settings/page.tsx` : même approche pour `Descriptions` (column={2})
- `components/bank-accounts/transaction-detail-drawer.tsx` : déjà `column={1}` — OK
- `components/partners/transfer-detail-drawer.tsx` : déjà `column={1}` — OK

### 5. PageHeader responsive — `components/shared/page-header.tsx`
- En mobile : empiler titre et bouton d'action verticalement (`flex-col items-start gap-3`) au lieu de `flex justify-between`
- Utiliser `flex-col md:flex-row` pour basculer

### 6. Barres d'outils responsive (RangePicker + boutons)
- `components/bank-accounts/bank-account-transactions.tsx` (l.287-313) : le `flex justify-between` de la barre d'outils → `flex flex-col md:flex-row gap-3` en mobile
- `components/partners/partner-transfers.tsx` (l.240-266) : même approche

### 7. Drawers/Modals responsive
- `components/bank-accounts/transaction-detail-drawer.tsx` : `size={480}` → `width` responsive (utiliser breakpoint, `width` à "100vw" en mobile, 480 en desktop, ou `width="min(480, 100vw)"`)
- `components/partners/transfer-detail-drawer.tsx` : même approche pour `size={480}`
- `components/settings/company-edit-drawer.tsx` : `size={520}` → même approche
- `components/settings/user-create-drawer.tsx` : `size={420}` → même approche
- `components/settings/user-edit-drawer.tsx` : `size={420}` → même approche
- `app/ws/settings/users/page.tsx` Drawer sessions : `size={480}` → même approche
- Modals (bank-account-form-modal, partner-form-modal, transaction modal, transfer modal) : pas de largeur fixe mais Ant Design gère déjà une largeur par défaut responsive. Ajouter `width="min(520, calc(100vw - 32px))"` pour borner.

### 8. Layout détail onglets responsive
- `app/ws/bank-accounts/[id]/layout.tsx` : le titre h1 et le solde peuvent déborder. Ajouter `truncate` ou `break-all` sur les textes longs.
- `app/ws/partners/[id]/layout.tsx` : même approche

### 9. Hook utilitaire `useBreakpoint`
- Créer `lib/hooks/use-breakpoint.ts` encapsulant `Grid.useBreakpoint` d'Ant Design
- Retourne `{ isMobile: boolean }` (true si < md)
- Utilisé par Sidebar, WorkspaceShell, Descriptions responsive, Drawers

## Risques
- Ant Design v6 `Sider` + `Drawer` : bien tester que le Sider ne se rend pas en double en mobile. En mode mobile, rendre le Sider conditionnel (`isMobile ? null : <Sider>`) et afficher uniquement le Drawer.
- Les `Descriptions` avec `column` dynamique nécessitent un state React qui change au resize. Utiliser le hook `useBreakpoint` pour que ce soit réactif.
- Les modals Ant Design ont un comportement de largeur par défaut. Ne pas surcontraindre.

## Validation
- Tester manuellement sur les tailles : 375px (iPhone), 768px (iPad), 1024px (iPad landscape), 1440px (desktop)
- Vérifier que le sidebar Drawer se ferme bien après navigation
- Vérifier que les tables scrollent horizontalement sans casser la layout
- Vérifier que les Descriptions passent à 1 colonne en mobile
- Vérifier que les Drawers ne débordent pas en mobile
