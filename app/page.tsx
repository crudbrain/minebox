'use client';

import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCompany } from "@/lib/hooks/use-company";
import { useSession } from "@/lib/hooks/use-session";

const { Title, Text } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { data: company, isLoading: companyLoading } = useCompany();
  const { data: session, isPending: sessionLoading } = useSession();

  useEffect(() => {
    if (!companyLoading && !sessionLoading && session) {
      router.push("/ws/dashboard");
    }
  }, [companyLoading, sessionLoading, session, router]);

  if (companyLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Title level={1}>Minebox</Title>
      <Text className="mb-6">
        Gestion de comptes bancaires et partenaires
      </Text>
      <div className="flex gap-4">
        {!company && (
          <Button type="primary" onClick={() => router.push("/setup")}>
            Configurer
          </Button>
        )}
        {!session && (
          <Button onClick={() => router.push("/login")}>
            Se connecter
          </Button>
        )}
        {session && (
          <Button type="primary" onClick={() => router.push("/ws/dashboard")}>
            Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
