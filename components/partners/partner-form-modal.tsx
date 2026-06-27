'use client';

import { Modal, Form, Input, Button, message } from "antd";
import { useEffect } from "react";
import {
  useCreatePartner,
  useUpdatePartner,
} from "@/lib/hooks/use-partners";

interface PartnerFormModalProps {
  open: boolean;
  onClose: () => void;
  partner?: any;
}

export function PartnerFormModal({ open, onClose, partner }: PartnerFormModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const isEdit = !!partner;

  useEffect(() => {
    if (open && isEdit && partner) {
      form.setFieldsValue(partner);
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, isEdit, partner, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: partner.id, data: values });
        message.success("Partenaire mis à jour");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Partenaire créé");
      }
      onClose();
    } catch {
      message.error("Échec de l'opération");
    }
  };

  return (
    <Modal
      title={isEdit ? "Modifier le partenaire" : "Nouveau partenaire"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Code requis" }]}
        >
          <Input disabled={isEdit} />
        </Form.Item>
        <Form.Item
          label="Solde initial"
          name="balance"
          rules={[{ required: true, message: "Solde requis" }]}
        >
          <Input type="number" disabled={isEdit} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={createMutation.isPending || updateMutation.isPending}
          block
        >
          {isEdit ? "Enregistrer" : "Créer"}
        </Button>
      </Form>
    </Modal>
  );
}
