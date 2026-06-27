'use client';

import { Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { BankAccountFormModal } from "./bank-account-form-modal";

interface BankAccountDetailProps {
  bankAccount: any;
}

export function BankAccountDetail({ bankAccount }: BankAccountDetailProps) {
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
        <Descriptions.Item label="Numéro de compte">
          {bankAccount.accountNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Solde">
          {formatCurrency(bankAccount.balance, company?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Prénom">
          {bankAccount.firstName}
        </Descriptions.Item>
        <Descriptions.Item label="Nom">{bankAccount.lastName}</Descriptions.Item>
        <Descriptions.Item label="Surnom">
          {bankAccount.surname || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Genre">
          {bankAccount.gender === "M" ? "Masculin" : "Féminin"}
        </Descriptions.Item>
        <Descriptions.Item label="Téléphone">
          {bankAccount.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Autre téléphone">
          {bankAccount.otherPhone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Statut">
          {bankAccount.blocked ? "Bloqué" : "Actif"}
        </Descriptions.Item>
        <Descriptions.Item label="Pays">
          {bankAccount.country || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Province">
          {bankAccount.province || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ville">
          {bankAccount.city || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Adresse">
          {bankAccount.address || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Créé le">
          {formatDate(bankAccount.createdAt)}
        </Descriptions.Item>
      </Descriptions>

      <BankAccountFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        bankAccount={bankAccount}
      />
    </div>
  );
}
