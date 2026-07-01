# Add icon and danger to logout menu item in UserDropdown

## File to modify

`components/ws/user-dropdown.tsx`

## Changes

### 1. Add `LogoutOutlined` to icon import (line 5)

```diff
- import { UserOutlined } from "@ant-design/icons";
+ import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
```

### 2. Add `icon` and `danger` to the logout item (line 30–34)

```diff
       {
         key: "logout",
         label: "Déconnecter",
+        icon: <LogoutOutlined />,
+        danger: true,
         onClick: handleSignOut,
       },
```

## Validation

- Click avatar: dropdown shows the logout item with a red icon and danger styling.
- Click "Déconnecter": sign-out still works and page reloads.
