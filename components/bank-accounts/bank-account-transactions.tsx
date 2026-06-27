'use client';

import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/hooks/use-transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

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

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        date: values.date?.toISOString(),
        accountId,
      };
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          data: payload,
        });
        message.success("Transaction mise à jour");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Transaction créée");
      }
      setModalOpen(false);
      setEditingTransaction(null);
      form.resetFields();
    } catch {
      message.error("Échec de l'opération");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Transaction supprimée");
    } catch {
      message.error("Échec de la suppression");
    }
  };

  const columns = [
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
  ];

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
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <Select placeholder="Sélectionner">
              <Select.Option value="DEPOSIT">Dépôt</Select.Option>
              <Select.Option value="WITHDRAWAL">Retrait</Select.Option>
              <Select.Option value="TRANSFER">Transfert</Select.Option>
            </Select>
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
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            block
          >
            {editingTransaction ? "Enregistrer" : "Créer"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
