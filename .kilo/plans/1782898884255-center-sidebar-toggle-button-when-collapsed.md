# Center Sidebar Toggle Button When Collapsed

## Context
In `components/ws/sidebar.tsx`, when the sidebar is collapsed, the company logo/name are hidden but the collapse/expand toggle button still has `className="ml-auto"`, pushing it to the far right instead of centering it.

## Change
**File:** `components/ws/sidebar.tsx`, line 113

**Before:**
```tsx
className="ml-auto"
```

**After:**
```tsx
className={collapsed ? "mx-auto" : "ml-auto"}
```

## Reasoning
- When expanded: company avatar/name occupy the left side, so `ml-auto` pushes the button to the right edge — correct behavior.
- When collapsed: avatar/name are hidden (via `{!collapsed && ...}`), leaving only the button in the container. `ml-auto` makes it stick to the right; `mx-auto` centers it horizontally.

## Validation
- Verify that in expanded state the button remains right-aligned next to the company name.
- Verify that in collapsed state the button is horizontally centered within the 80px-wide sider header area.
