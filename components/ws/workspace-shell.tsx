'use client';

import { useState } from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Sidebar } from "./sidebar";
import { UserDropdown } from "./user-dropdown";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

const { Content } = Layout;

interface WorkspaceShellProps {
  children: React.ReactNode;
  company?: any;
}

export function WorkspaceShell({ children, company }: WorkspaceShellProps) {
  const { isMobile } = useBreakpoint();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sidebar
        company={company}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
      />
      <Layout>
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
            />
            <div className="font-semibold truncate px-2">
              {company?.shortName || company?.name || "Minebox"}
            </div>
            <UserDropdown collapsed />
          </div>
        )}
        <Content className="p-3 md:p-6 bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
