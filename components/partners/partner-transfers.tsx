'use client';

import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Typography } from "antd";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import { useReactToPrint } from "react-to-print";
import {
  useTransfers,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
} from "@/lib/hooks/use-transfers";
import { usePartner } from "@/lib/hooks/use-partners";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";
import { TransferDetailDrawer } from "./transfer-detail-drawer";

const { RangePicker } = DatePicker;

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import type { ColumnsType } from "antd/es/table";

interface PartnerTransfersProps {
  partnerId: string;
}

export function PartnerTransfers({ partnerId }: PartnerTransfersProps) {
  const { data: company } = useCompany();
  const { data: partner } = usePartner(partnerId);
  const [form] = Form.useForm();
  const transferType = Form.useWatch("type", form);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [printData, setPrintData] = useState<any[] | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (modalOpen && editingTransfer) {
      form.setFieldsValue({
        ...editingTransfer,
        date: dayjs(editingTransfer.date),
      });
    }
  }, [modalOpen, editingTransfer, form]);

  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: (v) => Math.max(1, Number(v) || 1),
    serialize: String,
  });
  const [pageSize, setPageSize] = useQueryState("pageSize", {
    defaultValue: 10,
    parse: (v) => Math.max(1, Number(v) || 10),
    serialize: String,
  });

  const dateFrom = dateRange?.[0]?.toISOString();
  const dateTo = dateRange?.[1]?.toISOString();

  const { data, isLoading } = useTransfers({
    page: page,
    pageSize: pageSize,
    partnerId,
    dateFrom,
    dateTo,
  });

  const createMutation = useCreateTransfer();
  const updateMutation = useUpdateTransfer();
  const deleteMutation = useDeleteTransfer();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handlePrintClick = async () => {
    setIsPrinting(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", "1");
      sp.set("pageSize", "99999");
      sp.set("partnerId", partnerId);
      if (dateFrom) sp.set("dateFrom", dateFrom);
      if (dateTo) sp.set("dateTo", dateTo);
      const res = await fetch(`/api/transfers?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch transfers for print");
      const json = await res.json();
      setPrintData(json.data || []);
    } catch {
      message.error("Échec du chargement des données pour l'impression");
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (printData !== null) {
      const timer = setTimeout(() => {
        handlePrint();
        setIsPrinting(false);
        setPrintData(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printData, handlePrint]);

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
    setPage(1);
  };

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

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date: string) => formatDate(date),
      },
      {
        title: "Expéditeur",
        dataIndex: "sender",
        key: "sender",
        render: (v: string) => v || "-",
      },
      {
        title: "Entrée",
        key: "entry",
        align: "right",
        render: (_: any, record: any) =>
          record.type === "GOLD_TRANSFER"
            ? formatCurrency(record.amount, company?.currency)
            : "-",
      },
      {
        title: "Sortie",
        key: "exit",
        align: "right",
        render: (_: any, record: any) =>
          record.type === "MONEY_TRANSFER"
            ? formatCurrency(record.amount, company?.currency)
            : "-",
      },
      {
        title: "Qté Or",
        dataIndex: "goldQuantity",
        key: "goldQuantity",
        render: (v: string) => v || "-",
      },
      {
        title: "Type de transfert",
        key: "type",
        render: (_: any, record: any) =>
          record.type === "GOLD_TRANSFER"
            ? "Expédition de l'or"
            : record.type === "MONEY_TRANSFER"
            ? "Transfert d'argent"
            : record.type,
      },
      {
        title: "Solde",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        align: "right",
        render: (balanceAfter: number) => (
          <Typography.Text type={balanceAfter >= 0 ? "success" : "danger"}>
            {formatCurrency(balanceAfter, company?.currency)}
          </Typography.Text>
        ),
      },
      {
        title: "Note",
        dataIndex: "message",
        key: "message",
        render: (v: string) => v || "-",
      },
    ],
    [company?.currency]
  );

  const printTitle = "Historique des transferts";
  const printSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (partner) {
      parts.push(`Partenaire ${partner.code}`);
    }
    if (dateRange?.[0] && dateRange?.[1]) {
      parts.push(`Période : ${formatDate(dateRange[0].toISOString())} - ${formatDate(dateRange[1].toISOString())}`);
    }
    return parts.join(" — ");
  }, [partner, dateRange]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
        <RangePicker
          allowClear
          placeholder={["Date début", "Date fin"]}
          value={dateRange}
          onChange={handleDateRangeChange}
        />
        <div className="flex gap-2">
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrintClick}
            loading={isPrinting}
          >
            Imprimer
          </Button>
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
      </div>
      <Table
        size="small"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 900 }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedTransfer(record);
            setDrawerOpen(true);
          },
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          onChange: (p, ps) => {
            setPage(p);
            if (ps !== pageSize) setPageSize(ps);
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
        width={isMobile ? "calc(100vw - 32px)" : undefined}
        okButtonProps={{ autoFocus: true, htmlType: 'submit', loading: createMutation.isPending || updateMutation.isPending }}
        destroyOnHidden
        modalRender={(dom) => (
          <Form form={form} layout="vertical" onFinish={handleSubmit} clearOnDestroy disabled={createMutation.isPending || updateMutation.isPending}>
            {dom}
          </Form>
        )}
      >
        <Form.Item
          label="Type d'opération"
          name="type"
          rules={[{ required: true, message: "Type requis" }]}
        >
          <Select placeholder="Sélectionner" disabled={!!editingTransfer} options={[
            { value: "MONEY_TRANSFER", label: "Transfert d'argent" },
            { value: "GOLD_TRANSFER", label: "Expédition de l'or" },
          ]} />
        </Form.Item>
        <Form.Item
          label="Date de l'opération"
          name="date"
          rules={[{ required: true, message: "Date requise" }]}
        >
          <DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm:ss" />
        </Form.Item>
        {transferType !== "GOLD_TRANSFER" && (
          <Form.Item
            label="Expéditeur"
            name="sender"
            rules={[{ required: true, message: "Expéditeur requis" }]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item
          label="Montant"
          name="amount"
          rules={[{ required: true, message: "Montant requis" }]}
        >
          <InputNumber min={0.01} step={0.01} className="w-full" addonAfter={company?.currency} />
        </Form.Item>
        {transferType === "GOLD_TRANSFER" && (
          <Form.Item label="Quantité d'or" name="goldQuantity">
            <Input />
          </Form.Item>
        )}
        <Form.Item label="Message (Observation)" name="message">
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

      {/* Printable section */}
      <div
        ref={printRef}
        className="print-section"
        style={{ position: "fixed", left: -9999, top: 0, width: "100%", background: "#fff", padding: 24 }}
      >
        <div className="print-only-header" style={{ display: "none", marginBottom: 24 }}>
          {company?.logo && (
            <img
              src={company.logo}
              alt={company.name}
              style={{ height: 48, marginBottom: 8 }}
            />
          )}
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {company?.name}
          </h2>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>
          {printTitle}
        </h1>
        {printSubtitle && (
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#555" }}>
            {printSubtitle}
          </p>
        )}

        <Table
          columns={columns}
          dataSource={printData || []}
          rowKey="id"
          pagination={false}
          bordered
          size="small"
        />
      </div>

      <style>{`
        @media print {
          .print-only-header {
            display: block !important;
          }
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
