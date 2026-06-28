'use client';

import { useRef } from "react";
import { Drawer, Descriptions, Button, Dropdown } from "antd";
import {
  MoreOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransferDetailDrawerProps {
  open: boolean;
  transfer: any | null;
  onClose: () => void;
  onEdit: (transfer: any) => void;
  onDelete: (transfer: any) => void;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "MONEY_TRANSFER":
      return "Transfert d'argent";
    case "GOLD_TRANSFER":
      return "Transfert d'or";
    default:
      return type;
  }
}

export function TransferDetailDrawer({
  open,
  transfer,
  onClose,
  onEdit,
  onDelete,
}: TransferDetailDrawerProps) {
  const { data: company } = useCompany();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const dropdownItems = [
    {
      key: "edit",
      label: "Modifier",
      onClick: () => {
        if (transfer) onEdit(transfer);
      },
    },
    {
      key: "delete",
      label: "Supprimer",
      danger: true,
      onClick: () => {
        if (transfer) onDelete(transfer);
      },
    },
  ];

  return (
    <Drawer
      title="Détails du transfert"
      open={open}
      onClose={onClose}
      size={480}
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

        {transfer && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Date">
              {formatDate(transfer.date)}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {getTypeLabel(transfer.type)}
            </Descriptions.Item>
            <Descriptions.Item label="Expéditeur">
              {transfer.sender}
            </Descriptions.Item>
            <Descriptions.Item label="Montant">
              {formatCurrency(transfer.amount, company?.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Solde">
              {formatCurrency(transfer.balanceAfter, company?.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              {transfer.message || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Autres informations">
              {transfer.operator?.name || "-"}
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
