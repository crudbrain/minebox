"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "antd";

interface DetailTabsHeaderProps {
  tabs: { key: string; label: string; path: string }[];
}

export const DetailTabsHeader = memo(function DetailTabsHeader({
  tabs,
}: DetailTabsHeaderProps) {
  const pathname = usePathname();

  const activeKey =
    tabs.find((t) => pathname === t.path)?.key ?? tabs[0]?.key;

  const items = useMemo(
    () =>
      tabs.map((t) => ({
        key: t.key,
        label: <Link href={t.path}>{t.label}</Link>,
      })),
    [tabs]
  );

  return (
    <div>
      <Menu mode="horizontal" selectedKeys={[activeKey]} items={items} />
    </div>
  );
});
