'use client';

import { Modal, Form, Input, Select, Switch, Button, message } from "antd";
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
    if (open && isEdit && bankAccount) {
      form.setFieldsValue(bankAccount);
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, isEdit, bankAccount, generatedNumber, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: bankAccount.id, data: values });
        message.success("Compte mis à jour");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Compte créé");
      }
      onClose();
    } catch {
      message.error("Échec de l'opération");
    }
  };

  return (
    <Modal
      title={isEdit ? "Modifier le compte" : "Nouveau compte"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Numéro de compte" name="accountNumber">
          <Input disabled={isEdit} />
        </Form.Item>
        <Form.Item
          label="Prénom"
          name="firstName"
          rules={[{ required: true, message: "Prénom requis" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Nom"
          name="lastName"
          rules={[{ required: true, message: "Nom requis" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Surnom" name="surname">
          <Input />
        </Form.Item>
        <Form.Item
          label="Genre"
          name="gender"
          rules={[{ required: true, message: "Genre requis" }]}
        >
          <Select placeholder="Sélectionner">
            <Select.Option value="M">Masculin</Select.Option>
            <Select.Option value="F">Féminin</Select.Option>
          </Select>
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
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            block
          >
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
