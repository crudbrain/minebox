"use client";

import { Form, Input, Select, Button, Card, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCompany } from "@/lib/api/company";

const { Title } = Typography;

export function SetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await createCompany({
        company: {
          code: values.code,
          name: values.name,
          shortName: values.shortName,
          description: values.description,
          logo: values.logo,
          icon: values.icon,
          currency: values.currency,
          country: values.country,
          province: values.province,
          city: values.city,
          address: values.address,
          webSiteUrl: values.webSiteUrl,
          motto: values.motto,
          phone1: values.phone1,
          phone2: values.phone2,
          email: values.email,
          status: "ENABLED",
        },
        admin: {
          name: values.adminName,
          email: values.adminEmail,
          password: values.adminPassword,
          confirmPassword: values.adminConfirmPassword,
        },
      });
      message.success("Configuration réussie");
      router.push("/login");
    } catch {
      message.error("Échec de la configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <Card className="w-full max-w-2xl">
        <Title level={3} className="text-center">Configuration Minebox</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Title level={5}>Informations de l&apos;entreprise</Title>
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Code requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: "Nom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Nom court" name="shortName">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Devise"
            name="currency"
            rules={[{ required: true, message: "Devise requise" }]}
          >
            <Select
              placeholder="Sélectionner une devise"
              options={[{ value: "USD", label: "USD" }, { value: "CDF", label: "CDF" }]}
            />
          </Form.Item>
          <Form.Item label="Pays" name="country">
            <Input />
          </Form.Item>
          <Form.Item label="Province" name="province">
            <Input />
          </Form.Item>
          <Form.Item label="Ville" name="city">
            <Input />
          </Form.Item>
          <Form.Item label="Adresse" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="Site web" name="webSiteUrl">
            <Input />
          </Form.Item>
          <Form.Item label="Slogan" name="motto">
            <Input />
          </Form.Item>
          <Form.Item label="Téléphone 1" name="phone1">
            <Input />
          </Form.Item>
          <Form.Item label="Téléphone 2" name="phone2">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Logo" name="logo">
            <Input />
          </Form.Item>
          <Form.Item label="Icône" name="icon">
            <Input />
          </Form.Item>

          <Title level={5}>Administrateur</Title>
          <Form.Item
            label="Nom"
            name="adminName"
            rules={[{ required: true, message: "Nom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="adminEmail"
            rules={[
              { required: true, message: "Email requis" },
              { type: "email", message: "Email invalide" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mot de passe"
            name="adminPassword"
            rules={[{ required: true, message: "Mot de passe requis" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirmer le mot de passe"
            name="adminConfirmPassword"
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("adminPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Les mots de passe ne correspondent pas")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Configurer
          </Button>
        </Form>
      </Card>
    </div>
  );
}
