'use client';

import { Table, Button, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import {
  useTransfers,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
} from "@/lib/hooks/use-transfers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";
import { useCompany } from "@/lib/hooks/use-company";
import { TransferDetailDrawer } from "./transfer-detail-drawer";

interface PartnerTransfersProps {
  partnerId: string;
}

export function PartnerTransfers({ partnerId }: PartnerTransfersProps) {
  const { data: company } = useCompany();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      date: values.date?.toISOString(),
      partnerId,
    };
    if (editingTransfer) {
      updateMutation.mutate(
        { id: editingTransfer.id, data: payload },
        {
          onSuccess: () => {
            message.success("Transfert mis à jour");
            setModalOpen(false);
            setEditingTransfer(null);
          },
          onError: () => {
            message.error("Échec de l'opération");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          message.success("Transfert créé");
          setModalOpen(false);
          setEditingTransfer(null);
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
          message.success("Transfert supprimé");
          setDeleteTarget(null);
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
    ],
    [company?.currency]
  );

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
        onRow={(record) => ({
          onClick: () => {
            setSelectedTransfer(record);
            setDrawerOpen(true);
          },
          style: { cursor: "pointer" },
        })}
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

      <TransferDetailDrawer
        open={drawerOpen}
        transfer={selectedTransfer}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTransfer(null);
        }}
        onEdit={(record) => {
          setEditingTransfer(record);
          form.setFieldsValue({
            ...record,
            date: dayjs(record.date),
          });
          setDrawerOpen(false);
          setModalOpen(true);
        }}
        onDelete={(record) => {
          setDeleteTarget(record);
        }}
      />

      <Modal
        title={editingTransfer ? "Modifier transfert" : "Nouveau transfert"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTransfer(null);
        }}
        okText={editingTransfer ? "Enregistrer" : "Créer"}
        cancelText="Annuler"
        okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}
        destroyOnHidden
        modalRender={(dom) => (
          <Form form={form} layout="vertical" onFinish={handleSubmit} clearOnDestroy disabled={createMutation.isPending || updateMutation.isPending}>
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
            { value: "MONEY_TRANSFER", label: "Transfert d'argent" },
            { value: "GOLD_TRANSFER", label: "Transfert d'or" },
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
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDelete(deleteTarget.id); }}
        entityName="le transfert"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
