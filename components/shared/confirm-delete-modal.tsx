'use client';

import { Modal, Form, Input, Alert } from "antd";
import { useEffect } from "react";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  entityName: string;
  loading?: boolean;
  warningMessage?: string;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  entityName,
  loading = false,
  warningMessage,
}: ConfirmDeleteModalProps) {
  const [form] = Form.useForm();
  const confirmText = Form.useWatch("confirmText", form);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async () => {
    await onConfirm();
  };

  const isConfirmed = confirmText === "Supprimer";

  return (
    <Modal
      title="Confirmer la suppression"
      open={open}
      onCancel={onClose}
      okText="Supprimer"
      cancelText="Annuler"
      width={isMobile ? "calc(100vw - 32px)" : undefined}
      okButtonProps={{
        danger: true,
        htmlType: 'submit',
        loading,
        disabled: !isConfirmed,
      }}
      destroyOnHidden
      modalRender={(dom) => (
        <Form form={form} layout="vertical" onFinish={handleFinish} clearOnDestroy disabled={loading}>
          {dom}
        </Form>
      )}
    >
      <div className="flex flex-col gap-4">
        {warningMessage && <Alert type="warning" showIcon message={warningMessage} />}
        <p>Voulez-vous vraiment supprimer {entityName} ? Cette action est irr&eacute;versible.</p>
        <Form.Item
          name="confirmText"
          rules={[{
            validator: (_, value) => {
              if (value === "Supprimer") {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Veuillez taper "Supprimer" pour confirmer'));
            },
          }]}
        >
          <Input placeholder='Tapez "Supprimer" pour confirmer' />
        </Form.Item>
      </div>
    </Modal>
  );
}
