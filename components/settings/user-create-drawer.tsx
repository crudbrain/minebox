'use client';

import { Drawer, Form, Input, Select, Button, message } from "antd";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface UserCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  const percent = (score / 5) * 100;
  const colors = ["#ff4d4f", "#ff4d4f", "#faad14", "#faad14", "#52c41a", "#52c41a"];
  const labels = [
    "Très faible",
    "Faible",
    "Moyen",
    "Bon",
    "Fort",
    "Très fort",
  ];
  const color = colors[score];
  const label = labels[score];

  return (
    <div className="mt-2">
      <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs mt-1" style={{ color }}>
        {label}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Min. 8 caractères, majuscule, minuscule, chiffre, caractère spécial
      </div>
    </div>
  );
}

export function UserCreateDrawer({ open, onClose, onSuccess }: UserCreateDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const { isMobile } = useBreakpoint();

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => {
    setLoading(true);
    try {
      await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as "admin" | "user",
        data: { emailVerified: true },
      });
      message.success("Utilisateur créé avec succès");
      form.resetFields();
      setPasswordValue("");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Créer un utilisateur"
      size={isMobile ? "100vw" : 420}
      open={open}
      onClose={() => {
        form.resetFields();
        setPasswordValue("");
        onClose();
      }}
      closable={{placement:"end"}}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button type="primary" onClick={() => form.submit()} loading={loading}>
            Créer
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: "Nom requis" }]}
        >
          <Input placeholder="Nom complet" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email requis" },
            { type: "email", message: "Email invalide" },
          ]}
        >
          <Input placeholder="email@exemple.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[
            { required: true, message: "Mot de passe requis" },
            { min: 8, message: "Minimum 8 caractères" },
          ]}
        >
          <Input.Password
            placeholder="Mot de passe"
            onChange={(e) => setPasswordValue(e.target.value)}
          />
        </Form.Item>
        <PasswordStrength password={passwordValue} />
        <Form.Item
          name="confirmPassword"
          label="Confirmer le mot de passe"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirmation requise" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirmer le mot de passe" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Rôle"
          initialValue="user"
          rules={[{ required: true, message: "Rôle requis" }]}
        >
          <Select
            options={[
              { value: "user", label: "Utilisateur" },
              { value: "admin", label: "Administrateur" },
            ]}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
