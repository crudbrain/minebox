'use client';

import { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  message,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyUpdateInput } from "@/lib/schemas/company";

interface CompanyEditDrawerProps {
  open: boolean;
  onClose: () => void;
  company: any;
}

async function updateCompany(data: CompanyUpdateInput) {
  const res = await fetch("/api/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update company");
  }
  return res.json();
}

export function CompanyEditDrawer({ open, onClose, company }: CompanyEditDrawerProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      message.success("Entreprise mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["company"] });
      onClose();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  useEffect(() => {
    if (open && company) {
      form.setFieldsValue(company);
    }
  }, [open, company, form]);

  const handleSubmit = (values: CompanyUpdateInput) => {
    mutation.mutate(values);
  };

  return (
    <Drawer
      title="Modifier l'entreprise"
      width={520}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={mutation.isPending}
          >
            Enregistrer
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item name="code" label="Code">
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Nom">
          <Input />
        </Form.Item>
        <Form.Item name="shortName" label="Nom court">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="currency" label="Devise">
          <Select
            options={[
              { value: "USD", label: "USD" },
              { value: "CDF", label: "CDF" },
            ]}
          />
        </Form.Item>
        <Form.Item name="country" label="Pays">
          <Input />
        </Form.Item>
        <Form.Item name="province" label="Province">
          <Input />
        </Form.Item>
        <Form.Item name="city" label="Ville">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Adresse">
          <Input />
        </Form.Item>
        <Form.Item name="webSiteUrl" label="Site web">
          <Input />
        </Form.Item>
        <Form.Item name="motto" label="Devise">
          <Input />
        </Form.Item>
        <Form.Item name="phone1" label="Téléphone 1">
          <Input />
        </Form.Item>
        <Form.Item name="phone2" label="Téléphone 2">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="logo" label="Logo URL">
          <Input />
        </Form.Item>
        <Form.Item name="icon" label="Icône URL">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Statut">
          <Select
            options={[
              { value: "ENABLED", label: "Activé" },
              { value: "DISABLED", label: "Désactivé" },
            ]}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
