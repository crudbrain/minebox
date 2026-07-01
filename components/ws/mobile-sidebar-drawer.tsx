'use client';

import { Drawer, Avatar } from "antd";
import { useCompany } from "@/lib/hooks/use-company";
import { SidebarContent } from "./sidebar-content";

interface MobileSidebarDrawerProps {
  open?: boolean;
  onClose?: () => void;
  menuItems: any[];
  activeKey: string;
  onMenuClick: () => void;
  company?: any;
}

export function MobileSidebarDrawer({
  open,
  onClose,
  menuItems,
  activeKey,
  onMenuClick,
  company: companyProp,
}: MobileSidebarDrawerProps) {
  const { data: companyFromHook } = useCompany();
  const company = companyProp ?? companyFromHook;

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      size={280}
      closable={{ placement: "end" }}
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-center gap-2">
          {company?.logo ? (
            <Avatar src={company.logo} shape="square" />
          ) : (
            <Avatar shape="square">{company?.name?.[0]}</Avatar>
          )}
          <div className="font-semibold truncate">
            {company?.shortName || company?.name}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <SidebarContent
          menuItems={menuItems}
          activeKey={activeKey}
          onMenuClick={onMenuClick}
          collapsed={false}
        />
      </div>
    </Drawer>
  );
}
