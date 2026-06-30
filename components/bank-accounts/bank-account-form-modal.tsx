'use client';

import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useEffect } from "react";
import {
  useCreateBankAccount,
  useUpdateBankAccount,
} from "@/lib/hooks/use-bank-accounts";
import { useGenerateAccountNumber } from "@/lib/hooks/use-generate-account-number";

interface BankAccountFormModalProps {
  open: boolean;
  onClose: () => void;
  bankAccount?: any;
}

export function BankAccountFormModal({
  open,
  onClose,
  bankAccount,
}: BankAccountFormModalProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const isEdit = !!bankAccount;

  const { data: generatedNumber } = useGenerateAccountNumber(
    open && !isEdit
  );

  useEffect(() => {
    if (open && !isEdit && generatedNumber?.accountNumber) {
      form.setFieldValue("accountNumber", generatedNumber.accountNumber);
    }
  }, [open, isEdit, generatedNumber, form]);

  const handleSubmit = (values: any) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: bankAccount.id, data: values },
        {
          onSuccess: () => {
            message.success("Compte mis à jour");
            onClose();
          },
          onError: () => {
            message.error("Échec de l'opération");
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success("Compte créé");
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
      title={isEdit ? "Modifier le compte" : "Nouveau compte"}
      open={open}
      onCancel={onClose}
      okText={isEdit ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}
      destroyOnHidden
      modalRender={(dom) => (
        <Form form={form} layout="vertical" onFinish={handleSubmit} clearOnDestroy initialValues={isEdit ? bankAccount : { accountNumber: "" }} disabled={createMutation.isPending || updateMutation.isPending}>
          {dom}
        </Form>
      )}
    >
      <Form.Item label="Numéro de compte" name="accountNumber">
        <Input disabled={isEdit} />
      </Form.Item>
      <Form.Item
        label="Nom"
        name="lastName"
        rules={[{ required: true, message: "Nom requis" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Surnom" name="surname" rules={[{ required: true, message: "Surnom requis" }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Prénom"
        name="firstName"
        rules={[{ required: true, message: "Prénom requis" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Genre"
        name="gender"
        rules={[{ required: true, message: "Genre requis" }]}
      >
        <Select placeholder="Sélectionner" options={[
          { value: "M", label: "Masculin" },
          { value: "F", label: "Féminin" },
        ]} />
      </Form.Item>
      <Form.Item
        label="Téléphone"
        name="phone"
        rules={[{ required: true, message: "Téléphone requis" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Autre téléphone" name="otherPhone">
        <Input />
      </Form.Item>
      <Form.Item label="Bloqué" name="blocked" valuePropName="checked">
        <Switch />
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
    </Modal>
  );
}
