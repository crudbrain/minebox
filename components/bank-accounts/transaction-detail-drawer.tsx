'use client';

import { useRef } from "react";
import { Drawer, Descriptions, Button, Dropdown, Tooltip } from "antd";
import {
  MoreOutlined,
  PrinterOutlined,
  FileImageOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { toJpeg } from "html-to-image";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionDetailDrawerProps {
  open: boolean;
  transaction: any | null;
  onClose: () => void;
  accountId: string;
  onEdit: (transaction: any) => void;
  onDelete: (transaction: any) => void;
}

function getIntitule(transaction: any, forExport: boolean = false): string {
  if (!transaction) return "-";

  switch (transaction.type) {
    case "DEPOSIT": {
      if (forExport) return "Encaissement";
      const name = transaction.account
        ? `${transaction.account.firstName} ${transaction.account.lastName}`
        : "?";
      return `Encaissement de ${name}`;
    }
    case "WITHDRAWAL": {
      if (forExport) return "Décaissement";
      const name = transaction.account
        ? `${transaction.account.firstName} ${transaction.account.lastName}`
        : "?";
      return `Décaissement de ${name}`;
    }
    case "TRANSFER": {
      const from = transaction.fromAccount
        ? `${transaction.fromAccount.firstName} ${transaction.fromAccount.lastName}`
        : "?";
      const to = transaction.toAccount
        ? `${transaction.toAccount.firstName} ${transaction.toAccount.lastName}`
        : "?";
      return `Transfert de ${from} à ${to}`;
    }
    default:
      return transaction.type;
  }
}

export function TransactionDetailDrawer({
  open,
  transaction,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailDrawerProps) {
  const { data: company } = useCompany();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handleExportJpg = async () => {
    if (!componentRef.current || !transaction) return;

    const headerEl = componentRef.current.querySelector(
      ".print-only-header"
    ) as HTMLElement | null;
    const originalDisplay = headerEl?.style.display;
    if (headerEl) headerEl.style.display = "block";

    try {
      const dataUrl = await toJpeg(componentRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      const accountNumber = transaction.account?.accountNumber || "XXX";
      const filename = `MOV${accountNumber}-${transaction.id.slice(-7)}.jpg`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } finally {
      if (headerEl) headerEl.style.display = originalDisplay || "";
    }
  };

  const dropdownItems = [
    {
      key: "edit",
      label: "Modifier",
      onClick: () => {
        if (transaction) onEdit(transaction);
      },
    },
    {
      key: "delete",
      label: "Supprimer",
      danger: true,
      onClick: () => {
        if (transaction) onDelete(transaction);
      },
    },
  ];

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleShare = async () => {
    if (!transaction || !canShare) return;

    const accountNumber = transaction.account?.accountNumber || "XXX";
    const shareTitle = `Mouvement M${accountNumber}${transaction.id.slice(-7)}`;

    const firstName = transaction.account?.firstName || "";
    const lastName = transaction.account?.lastName || "";
    const surname = transaction.account?.surname?.toUpperCase() || "";
    const accountName = `${firstName.toUpperCase()} ${lastName.toUpperCase()} ${surname} (${accountNumber})`
      .replace(/\s+/g, " ")
      .trim();

    const shareText = `*Détails*

Date: *${formatDate(transaction.date)}*
Intitulé: *${getIntitule(transaction)}*
Montant: *${formatCurrency(transaction.amount, company?.currency)}*
Solde: *${formatCurrency(transaction.balanceAfter, company?.currency)}*
Note: *${transaction.message || "-"}*
Compte: *${accountName}*

*${company?.name}*`;

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
      });
    } catch {
      // Silently handle errors (user cancelled, etc.)
    }
  };

  return (
    <Drawer
      title="Détails de la transaction"
      open={open}
      onClose={onClose}
      width={480}
      extra={
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      }
    >
      <div className="flex gap-2 mb-4">
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
          Imprimer
        </Button>
        <Button icon={<FileImageOutlined />} onClick={handleExportJpg}>
          Exporter JPG
        </Button>
        {canShare ? (
          <Button icon={<ShareAltOutlined />} onClick={handleShare}>
            Partager
          </Button>
        ) : (
          <Tooltip title="Non disponible sur ce navigateur">
            <span>
              <Button icon={<ShareAltOutlined />} disabled>
                Partager
              </Button>
            </span>
          </Tooltip>
        )}
      </div>

      <div ref={componentRef} className="bg-white p-4">
        {/* Print-only header */}
        <div
          className="print-only-header"
          style={{ display: "none", marginBottom: 24 }}
        >
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

        {transaction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Date">
              {formatDate(transaction.date)}
            </Descriptions.Item>
            <Descriptions.Item label="Intitulé">
              {getIntitule(transaction)}
            </Descriptions.Item>
            <Descriptions.Item label="Montant">
              {formatCurrency(transaction.amount, company?.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Solde">
              {formatCurrency(transaction.balanceAfter, company?.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              {transaction.message || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="No compte">
              {transaction.account?.accountNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Autres informations">
              {transaction.operator
                ? `Opérateur: ${transaction.operator.name}`
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>

      <style>{`
        @media print {
          .print-only-header {
            display: block !important;
          }
        }
      `}</style>
    </Drawer>
  );
}
