'use client';

import { Modal, Form, Input, message } from "antd";
import {
  useCreatePartner,
  useUpdatePartner,
} from "@/lib/hooks/use-partners";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

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
  const { isMobile } = useBreakpoint();

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      balance: Number(values.balance),
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: partner.id, data },
        {
          onSuccess: () => {
            message.success("Partenaire mis à jour");
            onClose();
          },
          onError: () => {
            message.error("Échec de l'opération");
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          message.success("Partenaire créé");
          onClose();
        },
        onError: () => {
          message.error("Échec de l'opération");
        },
      });
    }
  };

  return (
    <Modal
      title={isEdit ? "Modifier le partenaire" : "Nouveau partenaire"}
      open={open}
      onCancel={onClose}
      okText={isEdit ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      width={isMobile ? "calc(100vw - 32px)" : undefined}
      okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}
      destroyOnHidden
      modalRender={(dom) => (
        <Form form={form} layout="vertical" onFinish={handleSubmit} clearOnDestroy initialValues={partner} disabled={createMutation.isPending || updateMutation.isPending}>
          {dom}
        </Form>
      )}
    >
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
    </Modal>
  );
}
