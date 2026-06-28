'use client';

import { Table, Button, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { useQueryState } from "nuqs";
import { useReactToPrint } from "react-to-print";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/hooks/use-transactions";
import { useBankAccount, useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";
import { TransactionDetailDrawer } from "./transaction-detail-drawer";

const { RangePicker } = DatePicker;

interface BankAccountTransactionsProps {
  accountId: string;
}

export function BankAccountTransactions({
  accountId,
}: BankAccountTransactionsProps) {
  const { data: company } = useCompany();
  const { data: bankAccount } = useBankAccount(accountId);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [printData, setPrintData] = useState<any[] | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const transactionType = Form.useWatch("type", form);

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

  const { data, isLoading } = useTransactions({
    page: page,
    pageSize: pageSize,
    accountId,
    dateFrom,
    dateTo,
  });

  const { data: bankAccountsData } = useBankAccounts({
    page: 1,
    pageSize: 100,
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handlePrintClick = async () => {
    setIsPrinting(true);
    try {
      const sp = new URLSearchParams();
      sp.set("page", "1");
      sp.set("pageSize", "99999");
      sp.set("accountId", accountId);
      if (dateFrom) sp.set("dateFrom", dateFrom);
      if (dateTo) sp.set("dateTo", dateTo);
      const res = await fetch(`/api/transactions?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch transactions for print");
      const json = await res.json();
      setPrintData(json.data || []);
    } catch {
      message.error("Échec du chargement des données pour l'impression");
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (printData !== null) {
      // Small delay to ensure DOM has rendered
      const timer = setTimeout(() => {
        handlePrint();
        setIsPrinting(false);
        setPrintData(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printData, handlePrint]);

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
        title: "Intitulé",
        key: "intitule",
        render: (_: any, record: any) => {
          if (record.type === "DEPOSIT") {
            const name = record.account
              ? `${record.account.firstName} ${record.account.lastName}`
              : "?";
            return `Encaissement de ${name}`;
          }
          if (record.type === "WITHDRAWAL") {
            const name = record.account
              ? `${record.account.firstName} ${record.account.lastName}`
              : "?";
            return `Décaissement de ${name}`;
          }
          if (record.type === "TRANSFER") {
            const from = record.fromAccount
              ? `${record.fromAccount.firstName} ${record.fromAccount.lastName}`
              : "?";
            const to = record.toAccount
              ? `${record.toAccount.firstName} ${record.toAccount.lastName}`
              : "?";
            return `Transfert de ${from} à ${to}`;
          }
          return "-";
        },
      },
      {
        title: "Entrée",
        key: "entry",
        render: (_: any, record: any) => {
          if (record.type === "DEPOSIT") {
            return formatCurrency(record.amount, company?.currency);
          }
          if (
            record.type === "TRANSFER" &&
            record.accountId === record.toAccountId
          ) {
            return formatCurrency(record.amount, company?.currency);
          }
          return "-";
        },
      },
      {
        title: "Sortie",
        key: "exit",
        render: (_: any, record: any) => {
          if (record.type === "WITHDRAWAL") {
            return formatCurrency(record.amount, company?.currency);
          }
          if (
            record.type === "TRANSFER" &&
            record.accountId !== record.toAccountId
          ) {
            return formatCurrency(record.amount, company?.currency);
          }
          return "-";
        },
      },
      {
        title: "Solde",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        render: (balanceAfter: number) =>
          formatCurrency(balanceAfter, company?.currency),
      },
      {
        title: "Note",
        dataIndex: "message",
        key: "message",
        render: (v: string) => v || "-",
      },
    ],
    [company?.currency, accountId]
  );

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
    setPage(1);
  };

  const printTitle = "Historique des transactions";
  const printSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (bankAccount) {
      parts.push(`${bankAccount.firstName} ${bankAccount.lastName} (${bankAccount.accountNumber})`);
    }
    if (dateRange?.[0] && dateRange?.[1]) {
      parts.push(`Période : ${formatDate(dateRange[0].toISOString())} - ${formatDate(dateRange[1].toISOString())}`);
    }
    return parts.join(" — ");
  }, [bankAccount, dateRange]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
              setEditingTransaction(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Nouvelle transaction
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            setSelectedTransaction(record);
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

      <TransactionDetailDrawer
        open={drawerOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTransaction(null);
        }}
        accountId={accountId}
        onEdit={(record) => {
          setEditingTransaction(record);
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

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDelete(deleteTarget.id); }}
        entityName={`la transaction "${deleteTarget?.title || deleteTarget?.id}"`}
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
