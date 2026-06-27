'use client';

import { Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { PartnerFormModal } from "./partner-form-modal";

interface PartnerDetailProps {
  partner: any;
}

export function PartnerDetail({ partner }: PartnerDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const { data: company } = useCompany();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
          Modifier
        </Button>
      </div>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Code">{partner.code}</Descriptions.Item>
        <Descriptions.Item label="Solde">
          {formatCurrency(partner.balance, company?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Créé le">
          {formatDate(partner.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Mis à jour le">
          {formatDate(partner.updatedAt)}
        </Descriptions.Item>
      </Descriptions>

      <PartnerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        partner={partner}
      />
    </div>
  );
}
