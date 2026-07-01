import { Button } from "antd";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 !bg-layout border-b border-border-secondary flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action && (
        <Button type="primary" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
