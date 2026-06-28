'use client';

import { Layout, Menu, Avatar, Skeleton } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/use-company";
import { useSession } from "@/lib/hooks/use-session";
import { UserDropdown } from "./user-dropdown";

const { Sider } = Layout;

export function Sidebar({ company: companyProp }: { company?: any }) {
  const { data: companyFromHook, isLoading: hookLoading } = useCompany();
  const company = companyProp ?? companyFromHook;
  const isLoading = companyProp ? false : hookLoading;
  const pathname = usePathname();
  const { data: session } = useSession();

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

  return (
    <Sider
      width={260}
      className="min-h-screen flex flex-col"
      theme="light"
    >
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        ) : (
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
      </div>

      <div className="flex-1 py-4">
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <UserDropdown />
      </div>
    </Sider>
  );
}
