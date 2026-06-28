'use client';

import { Drawer, Form, Input, Button, message } from "antd";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserEditDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function UserEditDrawer({ open, onClose, user, onSuccess }: UserEditDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async (values: { name: string; email: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      await authClient.admin.updateUser({
        userId: user.id,
        data: {
          name: values.name,
          email: values.email,
        },
      });
      message.success("Utilisateur mis à jour avec succès");
      onSuccess();
    } catch (error: any) {
      message.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Modifier l'utilisateur"
      size={420}
      open={open}
      onClose={() => {
        form.resetFields();
        onClose();
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button type="primary" onClick={() => form.submit()} loading={loading}>
            Enregistrer
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
      </Form>
    </Drawer>
  );
}
