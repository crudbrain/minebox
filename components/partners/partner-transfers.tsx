'use client';

import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import {
  useTransfers,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
} from "@/lib/hooks/use-transfers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

interface PartnerTransfersProps {
  partnerId: string;
}

export function PartnerTransfers({ partnerId }: PartnerTransfersProps) {
  const { data: company } = useCompany();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);

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

  const { data, isLoading } = useTransfers({
    page: currentPage,
    pageSize: currentPageSize,
    partnerId,
  });

  const createMutation = useCreateTransfer();
  const updateMutation = useUpdateTransfer();
  const deleteMutation = useDeleteTransfer();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        date: values.date?.toISOString(),
        partnerId,
      };
      if (editingTransfer) {
        await updateMutation.mutateAsync({
          id: editingTransfer.id,
          data: payload,
        });
        message.success("Transfert mis à jour");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Transfert créé");
      }
      setModalOpen(false);
      setEditingTransfer(null);
      form.resetFields();
    } catch {
      message.error("Échec de l'opération");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Transfert supprimé");
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
      title: "Expéditeur",
      dataIndex: "sender",
      key: "sender",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Opérateur",
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
              setEditingTransfer(record);
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
            setEditingTransfer(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Nouveau transfert
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
        title={editingTransfer ? "Modifier transfert" : "Nouveau transfert"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTransfer(null);
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
              <Select.Option value="MONEY_TRANSFER">Transfert d'argent</Select.Option>
              <Select.Option value="GOLD_TRANSFER">Transfert d'or</Select.Option>
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
          <Form.Item
            label="Expéditeur"
            name="sender"
            rules={[{ required: true, message: "Expéditeur requis" }]}
          >
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
            {editingTransfer ? "Enregistrer" : "Créer"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
