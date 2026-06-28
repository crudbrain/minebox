'use client';

import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/hooks/use-transactions";
import { useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BankAccountTransactionsProps {
  accountId: string;
}

export function BankAccountTransactions({
  accountId,
}: BankAccountTransactionsProps) {
  const { data: company } = useCompany();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const transactionType = Form.useWatch("type", form);

  const [page, setPage] = useQueryState("page", {
    parse: (v) => Math.max(1, Number(v) || 1),
    serialize: String,
  });
  const [pageSize, setPageSize] = useQueryState("pageSize", {
    parse: (v) => Math.max(1, Number(v) || 10),
    serialize: String,
  });

  const currentPage = page || 1;
  const currentPageSize = pageSize || 10;

  const { data, isLoading } = useTransactions({
    page: currentPage,
    pageSize: currentPageSize,
    accountId,
  });

  const { data: bankAccountsData } = useBankAccounts({
    page: 1,
    pageSize: 100,
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const bankAccountOptions = useMemo(() => {
    return (bankAccountsData?.data || [])
      .filter((acc: any) => acc.id !== accountId)
      .map((acc: any) => ({
        value: acc.id,
        label: `${acc.firstName} ${acc.lastName} (${acc.accountNumber})`,
      }));
  }, [bankAccountsData, accountId]);

  const handleSubmit = (values: any) => {
    const payload: any = {
      ...values,
      date: values.date?.toISOString(),
      accountId,
    };

    if (values.type === "TRANSFER") {
      payload.fromAccountId = values.fromAccountId || accountId;
      payload.toAccountId = values.toAccountId;
    }

    if (editingTransaction) {
      updateMutation.mutate(
        { id: editingTransaction.id, data: payload },
        {
          onSuccess: () => {
            message.success("Transaction mise à jour");
            setModalOpen(false);
            setEditingTransaction(null);
          },
          onError: () => {
            message.error("Échec de l'opération");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          message.success("Transaction créée");
          setModalOpen(false);
          setEditingTransaction(null);
        },
        onError: () => {
          message.error("Échec de l'opération");
        },
      });
    }
  };

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          message.success("Transaction supprimée");
        },
        onError: () => {
          message.error("Échec de la suppression");
        },
      });
    },
    [deleteMutation]
  );

  const columns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date: string) => formatDate(date),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Montant",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) =>
          formatCurrency(amount, company?.currency),
      },
      {
        title: "Quantité d'or",
        dataIndex: "goldQuantity",
        key: "goldQuantity",
        render: (v: string) => v || "-",
      },
      {
        title: "Titre",
        dataIndex: "title",
        key: "title",
        render: (v: string) => v || "-",
      },
      {
        title: "Message",
        dataIndex: "message",
        key: "message",
      },
      {
        title: "Transfert",
        dataIndex: "transferGroupId",
        key: "transfer",
        render: (_: any, record: any) => {
          if (record.type !== "TRANSFER") return "-";
          const from = record.fromAccount
            ? `${record.fromAccount.firstName} ${record.fromAccount.lastName}`
            : "?";
          const to = record.toAccount
            ? `${record.toAccount.firstName} ${record.toAccount.lastName}`
            : "?";
          return `${from} → ${to}`;
        },
      },
      {
        title: "Opérateur",
        dataIndex: ["operator", "name"],
        key: "operator",
        render: (_: any, record: any) => record.operator?.name || "-",
      },
      {
        title: "Solde après",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        render: (balanceAfter: number) =>
          formatCurrency(balanceAfter, company?.currency),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: any) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTransaction(record);
                form.setFieldsValue({
                  ...record,
                  date: dayjs(record.date),
                });
                setModalOpen(true);
              }}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              loading={deleteMutation.isPending}
            />
          </Space>
        ),
      },
    ],
    [company?.currency, deleteMutation.isPending, handleDelete]
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTransaction(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Nouvelle transaction
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: currentPageSize,
          total: data?.total || 0,
          onChange: (p, ps) => {
            setPage(p);
            if (ps !== currentPageSize) setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editingTransaction ? "Modifier transaction" : "Nouvelle transaction"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        okText={editingTransaction ? "Enregistrer" : "Créer"}
        cancelText="Annuler"
        okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}
        destroyOnHidden
        modalRender={(dom) => (
          <Form form={form} layout="vertical" onFinish={handleSubmit} clearOnDestroy disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}>
            {dom}
          </Form>
        )}
      >
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Date requise" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Type requis" }]}
        >
          <Select placeholder="Sélectionner" options={[
            { value: "DEPOSIT", label: "Dépôt" },
            { value: "WITHDRAWAL", label: "Retrait" },
            { value: "TRANSFER", label: "Transfert" },
          ]} />
        </Form.Item>
        <Form.Item
          label="Montant"
          name="amount"
          rules={[{ required: true, message: "Montant requis" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Quantité d'or" name="goldQuantity">
          <Input />
        </Form.Item>
        <Form.Item label="Titre" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Message" name="message">
          <Input.TextArea />
        </Form.Item>

        {transactionType === "TRANSFER" && (
          <>
            <Form.Item
              label="Compte source"
              name="fromAccountId"
              initialValue={accountId}
              rules={[{ required: true, message: "Compte source requis" }]}
            >
              <Select disabled placeholder="Compte courant" options={[
                { value: accountId, label: "Compte courant" },
              ]} />
            </Form.Item>
            <Form.Item
              label="Compte destination"
              name="toAccountId"
              rules={[{ required: true, message: "Compte destination requis" }]}
            >
              <Select
                placeholder="Sélectionner un compte"
                options={bankAccountOptions}
              />
            </Form.Item>
          </>
        )}
      </Modal>
    </div>
  );
}
