'use client';

import { Layout } from "antd";
import { Sidebar } from "./sidebar";

const { Content } = Layout;

interface WorkspaceShellProps {
  children: React.ReactNode;
  company?: any;
}

export function WorkspaceShell({ children, company }: WorkspaceShellProps) {
  return (
    <Layout className="min-h-screen">
      <Sidebar company={company} />
      <Content className="p-6 bg-gray-50">
        {children}
      </Content>
    </Layout>
  );
}
