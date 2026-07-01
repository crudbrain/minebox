"use client";

import { Form, Input, Button, Card, Typography, message } from "antd";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const { Link } = Typography;

interface LoginFormProps {
  hasCompany: boolean;
}

export function LoginForm({ hasCompany }: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (result.error) {
        const errMsg = (result.error.message || "").toLowerCase();
        const errCode = (result.error as any).code || "";
        if (
          errMsg.includes("invalid email or password") ||
          errMsg.includes("invalid credentials") ||
          errCode === "INVALID_EMAIL_OR_PASSWORD"
        ) {
          message.error("Email ou mot de passe incorrect");
        } else if (
          errMsg.includes("account not found") ||
          errMsg.includes("user not found") ||
          errCode === "USER_NOT_FOUND"
        ) {
          message.error("Aucun compte trouvé avec cet email");
        } else {
          message.error(result.error.message || "Échec de la connexion");
        }
      } else {
        message.success("Connexion réussie");
        window.location.reload();
      }
    } catch {
      message.error("Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-layout">
      <Card className="w-full max-w-sm">
        <Form layout="vertical" onFinish={onFinish} disabled={loading}>
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
          <Button type="primary" htmlType="submit" loading={loading} disabled={loading} block>
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
