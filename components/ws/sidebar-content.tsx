'use client';

import { Menu } from "antd";
import { UserDropdown } from "./user-dropdown";

interface SidebarContentProps {
  menuItems: any[];
  activeKey: string;
  onMenuClick: () => void;
  collapsed?: boolean;
}

export function SidebarContent({ menuItems, activeKey, onMenuClick, collapsed = false }: SidebarContentProps) {
  return (
    <>
      <div className="flex-1 py-4 overflow-auto">
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={onMenuClick}
        />
      </div>

      <div className="p-4 border-t border-border-secondary shrink-0">
        <UserDropdown collapsed={collapsed} />
      </div>
    </>
  );
}
