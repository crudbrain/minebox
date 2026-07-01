"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "antd";

const tabs = [
  { key: "company", label: "Entreprise", path: "/ws/settings" },
  { key: "users", label: "Utilisateurs", path: "/ws/settings/users" },
];

export const SettingsTabs = memo(function SettingsTabs() {
  const pathname = usePathname();

  const activeKey =
    tabs.find((t) => pathname === t.path)?.key ??
    tabs.find((t) => pathname.startsWith(t.path))?.key ??
    tabs[0]?.key;

  const items = useMemo(
    () =>
      tabs.map((t) => ({
        key: t.key,
        label: <Link href={t.path}>{t.label}</Link>,
      })),
    []
  );

  return (
    <div>
      <Menu mode="horizontal" selectedKeys={[activeKey]} items={items} />
    </div>
  );
});
