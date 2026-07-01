# Fix UserDropdown Menu Width When Sidebar Is Collapsed

## Context
In `components/ws/user-dropdown.tsx`, when the sidebar is collapsed (80px wide), the Ant Design `Dropdown` menu inherits the narrow container width, causing the name and email items to be truncated. The dropdown menu should take its width from its content, not from the trigger container.

## Change
**File:** `components/ws/user-dropdown.tsx`

**Before (line 42):**
```tsx
<Dropdown menu={{ items }} placement="topRight">
```

**After:**
```tsx
<Dropdown menu={{ items }} placement="topRight" overlayStyle={{ minWidth: 'max-content' }}>
```

## Reasoning
- `overlayStyle={{ minWidth: 'max-content' }}` tells the dropdown overlay to size itself based on the natural width of its content (the longest label), regardless of how narrow the trigger element is.
- This does not affect the expanded sidebar case — the dropdown already has enough room there, and `max-content` will simply compute to whatever the labels need.
- This is a single-line change on the `Dropdown` component. No other files need modification.

## Validation
- When sidebar is expanded: dropdown items show full name and email (unchanged behavior).
- When sidebar is collapsed: dropdown items show full name and email (no truncation), and the dropdown menu is wide enough to fit them.
