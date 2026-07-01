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

export function UserCreateDrawer({ open, onClose, onSuccess }: UserCreateDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { isMobile } = useBreakpoint();

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setLoading(true);
    try {
      await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as "admin" | "user",
      });
      message.success("Utilisateur créé avec succès");
      form.resetFields();
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
        onClose();
      }}
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
          <Input.Password placeholder="Mot de passe" />
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
