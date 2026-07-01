# Sidebar layout fixes

## Problem 1: Footer stuck to menu (no vertical spacing)

**Root cause**: `sidebarContent` is placed directly as children of `<Sider>`, but the Sider component's internal DOM structure doesn't propagate `display:flex; flex-direction:column` to its immediate content wrapper. The `flex-1` class on the menu div has no effect because there is no flex parent container wrapping the three sections (header / menu / footer).

**Fix**: Wrap `{sidebarContent}` in a `div className="flex flex-col h-full"` inside the `<Sider>`, matching the pattern already used for the mobile Drawer (line 137).

**File**: `components/ws/sidebar.tsx` line 154 — change:
```tsx
<Sider ...>
  {sidebarContent}
</Sider>
```
to:
```tsx
<Sider ...>
  <div className="flex flex-col h-full">
    {sidebarContent}
  </div>
</Sider>
```

## Problem 2: Company Avatar visible when sidebar is collapsed

**Root cause**: Lines 90-94 unconditionally render the company `Avatar` (logo or initial). When collapsed, this wastes the limited 80px width and pushes the collapse-toggle button.

**Fix**: Wrap the company Avatar block in a `{!collapsed && (...)}` guard, same pattern already used for the company name text on line 95.

**File**: `components/ws/sidebar.tsx` lines 89-99 — change:
```tsx
{company?.logo ? (
  <Avatar src={company.logo} size="large" />
) : (
  <Avatar size="large">{company?.name?.[0]}</Avatar>
)}
{!collapsed && (
  <div className="font-semibold truncate">
    {company?.shortName || company?.name}
  </div>
)}
```
to:
```tsx
{!collapsed && (
  <>
    {company?.logo ? (
      <Avatar src={company.logo} size="large" />
    ) : (
      <Avatar size="large">{company?.name?.[0]}</Avatar>
    )}
    <div className="font-semibold truncate">
      {company?.shortName || company?.name}
    </div>
  </>
)}
```

## Validation

- Open the app at any workspace route.
- Confirm the sidebar footer (UserDropdown) is pinned to the bottom with the menu taking remaining space above it.
- Toggle the sidebar collapsed state and confirm the company Avatar and name disappear, leaving only the collapse-toggle button centered.
- Test on mobile breakpoint to confirm Drawer sidebar is unaffected.
