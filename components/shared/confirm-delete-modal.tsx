'use client';

import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  entityName: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  entityName,
  loading = false,
}: ConfirmDeleteModalProps) {
  const [form] = Form.useForm();
  const confirmText = Form.useWatch("confirmText", form);

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
