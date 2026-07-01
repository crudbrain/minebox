# Fix Avatar Size in Sidebar and Mobile Sidebar

## Problem
All Avatar components in the sidebar and mobile-sidebar use `size="large"` (40px), making them appear too wide/large. They should use the default size (32px).

## Changes

### 1. `components/ws/sidebar.tsx` (lines 120-122)
Remove `size="large"` from both Avatar elements:
- `<Avatar src={company.logo} size="large" shape="square" />` → `<Avatar src={company.logo} shape="square" />`
- `<Avatar size="large" shape="square">{company?.name?.[0]}</Avatar>` → `<Avatar shape="square">{company?.name?.[0]}</Avatar>`

### 2. `components/ws/mobile-sidebar-drawer.tsx` (lines 38-40)
Remove `size="large"` from both Avatar elements:
- `<Avatar src={company.logo} size="large" shape="square" />` → `<Avatar src={company.logo} shape="square" />`
- `<Avatar size="large" shape="square">{company?.name?.[0]}</Avatar>` → `<Avatar shape="square">{company?.name?.[0]}</Avatar>`

## No other files affected
- `components/ws/user-dropdown.tsx` already uses default-size Avatar (no `size` prop)
