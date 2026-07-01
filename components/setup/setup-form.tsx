"use client";

import { Form, Input, Select, Button, Card, Typography, Divider, message } from "antd";
import { useState } from "react";
import { createCompany } from "@/lib/api/company";

const { Title } = Typography;

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

export function SetupForm({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    if (loading) return;
    setLoading(true);
    try {
      await createCompany({
        company: {
          code,
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
      window.location.reload();
    } catch (e: any) {
      if (e?.details && typeof e.details === "object") {
        const fieldErrors: { name: string[]; errors: string[] }[] = [];
        const flatten = e.details.formErrors || [];
        const fieldIssues = e.details.fieldErrors || {};
        for (const msg of flatten) {
          fieldErrors.push({ name: [], errors: [msg] });
        }
        for (const [field, msgs] of Object.entries(fieldIssues)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            const antdField = field.startsWith("company.")
              ? field.replace("company.", "")
              : field.startsWith("admin.")
                ? field.replace("admin.", "admin")
                : field;
            fieldErrors.push({
              name: [antdField],
              errors: msgs as string[],
            });
          }
        }
        if (fieldErrors.length > 0) {
          form.setFields(fieldErrors);
        } else {
          message.error(e.message || "Échec de la configuration");
        }
      } else {
        message.error(e?.message || "Échec de la configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-layout py-8">
      <Card className="w-full max-w-lg">
        <Title level={3}>Configuration</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
        >
          <Divider titlePlacement="left">Informations de l&apos;entreprise</Divider>
          <Form.Item
            label="Nom de l'entreprise"
            name="name"
            rules={[{ required: true, message: "Nom de l'entreprise requis" }]}
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
              options={[
                { value: "USD", label: "USD" },
                { value: "CDF", label: "CDF" },
              ]}
            />
          </Form.Item>

          <Divider titlePlacement="left">Localisation</Divider>
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
            <Input.TextArea rows={3} />
          </Form.Item>

          <Divider titlePlacement="left">Contact & Divers</Divider>
          <Form.Item
            label="Site web"
            name="webSiteUrl"
            rules={[{ type: "url", message: "URL invalide" }]}
          >
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
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Email invalide" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Logo"
            name="logo"
            rules={[{ type: "url", message: "URL invalide" }]}
          >
            <Input placeholder="URL du logo (https://...)" />
          </Form.Item>
          <Form.Item
            label="Icône"
            name="icon"
            rules={[{ type: "url", message: "URL invalide" }]}
          >
            <Input placeholder="URL de l'icône (https://...)" />
          </Form.Item>

          <Divider titlePlacement="left">Administrateur</Divider>
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
            rules={[
              { required: true, message: "Mot de passe requis" },
              { min: 8, message: "Mot de passe minimum 8 caractères" },
            ]}
          >
            <Input.Password
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </Form.Item>
          <PasswordStrength password={passwordValue} />
          <Form.Item
            label="Confirmer le mot de passe"
            name="adminConfirmPassword"
            dependencies={["adminPassword"]}
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("adminPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Les mots de passe ne correspondent pas"),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            disabled={loading}
          >
            Configurer
          </Button>
        </Form>
      </Card>
    </div>
  );
}
