'use client';

import { Layout, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/hooks/use-session";
import { useCompany } from "@/lib/hooks/use-company";
import { Sidebar } from "@/components/ws/sidebar";

const { Content } = Layout;

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: company, isLoading: companyLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
    if (!companyLoading && !company) {
      router.push("/setup");
    }
  }, [session, sessionLoading, company, companyLoading, router]);

  if (sessionLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!session || !company) {
    return null;
  }

  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Content className="p-6 bg-gray-50">
        {children}
      </Content>
    </Layout>
  );
}
