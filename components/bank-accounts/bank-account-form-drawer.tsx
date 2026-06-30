'use client';

import { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  message,
} from "antd";
import {
  useCreateBankAccount,
  useUpdateBankAccount,
} from "@/lib/hooks/use-bank-accounts";
import { useGenerateAccountNumber } from "@/lib/hooks/use-generate-account-number";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface BankAccountFormDrawerProps {
  open: boolean;
  onClose: () => void;
  bankAccount?: any;
}

export function BankAccountFormDrawer({
  open,
  onClose,
  bankAccount,
}: BankAccountFormDrawerProps) {
  const [form] = Form.useForm();
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const isEdit = !!bankAccount;
  const { isMobile } = useBreakpoint();

  const { data: generatedNumber } = useGenerateAccountNumber(
    open && !isEdit
  );

  useEffect(() => {
    if (open && !isEdit && generatedNumber?.accountNumber) {
      form.setFieldValue("accountNumber", generatedNumber.accountNumber);
    }
  }, [open, isEdit, generatedNumber, form]);

  useEffect(() => {
    if (open && isEdit && bankAccount) {
      form.setFieldsValue(bankAccount);
    }
  }, [open, isEdit, bankAccount, form]);

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

  const mutationPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      title={isEdit ? "Modifier le compte" : "Nouveau compte"}
      width={isMobile ? "100vw" : 520}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={mutationPending}
          >
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={isEdit ? undefined : { accountNumber: "", blocked: false }}
        disabled={mutationPending}
      >
        <Card title="Identité" size="small" style={{ marginBottom: 16 }}>
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
          <Form.Item label="Bloqué" name="blocked" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Contact" size="small" style={{ marginBottom: 16 }}>
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
        </Card>

        <Card title="Adresse" size="small" style={{ marginBottom: 16 }}>
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
        </Card>
      </Form>
    </Drawer>
  );
}
