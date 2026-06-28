"use client";

import { Form, Input, Button, Card, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const { Title, Link } = Typography;

interface LoginFormProps {
  hasCompany: boolean;
}

export function LoginForm({ hasCompany }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (result.error) {
        message.error(result.error.message || "Échec de la connexion");
      } else {
        message.success("Connexion réussie");
        router.push("/ws");
      }
    } catch {
      message.error("Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <Title level={3} className="text-center">Minebox</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email requis" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[{ required: true, message: "Mot de passe requis" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Se connecter
          </Button>
        </Form>
        {!hasCompany && (
          <div className="text-center mt-4">
            <Link href="/setup">Configurer l&apos;application</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
