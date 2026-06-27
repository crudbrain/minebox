import { Menu } from "antd";

interface DetailTabsHeaderProps {
  title: string;
  tabs: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function DetailTabsHeader({
  title,
  tabs,
  activeKey,
  onChange,
}: DetailTabsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          onClick: () => onChange(t.key),
        }))}
      />
    </div>
  );
}
