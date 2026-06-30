# Fix Sidebar Layout & Add Collapse Toggle

## Problem
- The Ant Design `Sider` doesn't properly distribute header, menu, and footer across full screen height
- No collapse/expand toggle button exists

## Tasks

### 1. Restructure Sider layout for proper height distribution
In `components/ws/sidebar.tsx`:
- Change Sider className from `min-h-screen flex flex-col` to `h-screen` and add `style={{ display: 'flex', flexDirection: 'column' }}` (Ant Sider doesn't propagate Tailwind flex reliably)
- Header div: add `shrink-0` class
- Menu wrapper div: add `overflow-auto` class (keep existing `flex-1 py-4`)
- Footer div: add `shrink-0` class

### 2. Add collapsed state and toggle button
- Add `const [collapsed, setCollapsed] = useState(false)` in `Sidebar`
- Add Sider props: `collapsed={collapsed}`, `collapsedWidth={80}`, `trigger={null}` (disable Ant's default trigger)
- Import `useState` from React, `MenuFoldOutlined`/`MenuUnfoldOutlined` from `@ant-design/icons`
- Add toggle button to the right of the header: `<Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />` inside the header div, positioned with `ml-auto` or `justify-between`

### 3. Adapt content for collapsed mode
- Header: when collapsed, show only `<Avatar>` (no company name) + toggle button, center or left-align
- UserDropdown: pass `collapsed` prop; when collapsed, render only `<Avatar icon={<UserOutlined />} />` without the dropdown text, still wrapped in `<Dropdown>` for logout
- Ant Menu automatically shows only icons in collapsed mode — no changes needed

## Files affected
- `components/ws/sidebar.tsx` — main changes
- `components/ws/user-dropdown.tsx` — add `collapsed` prop support

## Validation
- Visual check: header stays top, footer stays bottom, menu scrolls in between at any screen height
- Toggle button: clicking collapses/expands the sidebar, icons switch between MenuFold/MenuUnfold
- Collapsed state: only icons shown for menu items, avatar-only for header and footer
