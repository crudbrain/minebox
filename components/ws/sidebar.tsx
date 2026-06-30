'use client';

import { useState } from "react";
import { Layout, Menu, Avatar, Skeleton, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/use-company";
import { useSession } from "@/lib/hooks/use-session";
import { UserDropdown } from "./user-dropdown";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

const { Sider } = Layout;

function getActiveKey(pathname: string, keys: string[]): string {
  let best = "/";
  for (const key of keys) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      if (key.length > best.length) best = key;
    }
  }
  return best;
}

interface SidebarProps {
  company?: any;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ company: companyProp, mobileOpen, onMobileClose }: SidebarProps) {
  const { data: companyFromHook, isLoading: hookLoading } = useCompany();
  const company = companyProp ?? companyFromHook;
  const isLoading = companyProp ? false : hookLoading;
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile } = useBreakpoint();

  const menuItems = [
    {
      key: "/ws",
      icon: <DashboardOutlined />,
      label: <Link href="/ws">Dashboard</Link>,
    },
    {
      key: "/ws/bank-accounts",
      icon: <BankOutlined />,
      label: <Link href="/ws/bank-accounts">Banque et crédits</Link>,
    },
    {
      key: "/ws/partners",
      icon: <TeamOutlined />,
      label: <Link href="/ws/partners">Partenaires et crédits</Link>,
    },
    ...(session?.user?.role === "admin"
      ? [
          {
            key: "/ws/settings",
            icon: <SettingOutlined />,
            label: <Link href="/ws/settings">Paramètres</Link>,
          },
        ]
      : []),
  ];

  const allKeys = menuItems.map((item) => item.key);
  const activeKey = getActiveKey(pathname, allKeys);

  const handleMenuClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <>
      <div className="p-4 flex items-center gap-3 border-b border-gray-200 shrink-0">
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        ) : (
          <>
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
          </>
        )}
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          />
        )}
      </div>

      <div className="flex-1 py-4 overflow-auto">
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </div>

      <div className="p-4 border-t border-gray-200 shrink-0">
        <UserDropdown collapsed={collapsed} />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        width={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </Drawer>
    );
  }

  return (
    <Sider
      width={260}
      collapsed={collapsed}
      collapsedWidth={80}
      trigger={null}
      className="h-screen"
      theme="light"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {sidebarContent}
    </Sider>
  );
}
