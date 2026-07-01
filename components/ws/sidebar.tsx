'use client';

import { useState, useMemo, useCallback } from "react";
import { Layout, Avatar, Skeleton, Button } from "antd";
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
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import { SidebarContent } from "./sidebar-content";
import { MobileSidebarDrawer } from "./mobile-sidebar-drawer";

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

const MENU_KEYS = ["/ws", "/ws/bank-accounts", "/ws/partners", "/ws/settings"];

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

  const menuItems = useMemo(
    () => [
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
    ],
    [session?.user?.role]
  );

  const activeKey = useMemo(() => getActiveKey(pathname, MENU_KEYS), [pathname]);

  const handleMenuClick = useCallback(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [isMobile, onMobileClose]);

  if (isMobile) {
    return (
      <MobileSidebarDrawer
        open={mobileOpen}
        onClose={onMobileClose}
        menuItems={menuItems}
        activeKey={activeKey}
        onMenuClick={handleMenuClick}
        company={companyProp}
      />
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
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3 border-b border-border-secondary shrink-0">
          {isLoading ? (
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          ) : (
            <>
              {!collapsed && (
                <>
                  {company?.logo ? (
                    <Avatar src={company.logo} size="large" shape="square" />
                  ) : (
                    <Avatar size="large" shape="square">{company?.name?.[0]}</Avatar>
                  )}
                  <div className="font-semibold truncate">
                    {company?.shortName || company?.name}
                  </div>
                </>
              )}
            </>
          )}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "mx-auto" : "ml-auto"}
          />
        </div>

        <SidebarContent
          menuItems={menuItems}
          activeKey={activeKey}
          onMenuClick={handleMenuClick}
          collapsed={collapsed}
        />
      </div>
    </Sider>
  );
}
