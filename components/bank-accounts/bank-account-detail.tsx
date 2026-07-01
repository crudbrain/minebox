'use client';

import { Descriptions, Button, Card, Switch, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { useDeleteBankAccount, useUpdateBankAccount } from "@/lib/hooks/use-bank-accounts";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";
import { BankAccountFormDrawer } from "./bank-account-form-drawer";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface BankAccountDetailProps {
  bankAccount: any;
}

export function BankAccountDetail({ bankAccount }: BankAccountDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlocked, setPendingBlocked] = useState<boolean | null>(null);
  const { data: company } = useCompany();
  const { isMobile } = useBreakpoint();
  const router = useRouter();
  const deleteMutation = useDeleteBankAccount();
  const updateMutation = useUpdateBankAccount();

  const handleDelete = () => {
    deleteMutation.mutate(bankAccount.id, {
      onSuccess: () => router.push('/ws/bank-accounts'),
    });
  };

  const handleStatusChange = () => {
    if (pendingBlocked === null) return;
    updateMutation.mutate(
      { id: bankAccount.id, data: { blocked: pendingBlocked } },
      {
        onSuccess: () => {
          message.success(pendingBlocked ? "Compte bloqué" : "Compte activé");
          setConfirmOpen(false);
        },
        onError: () => {
          message.error("Échec de l'opération");
        },
      }
    );
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
          Modifier
        </Button>
      </div>
      <Descriptions bordered column={isMobile ? 1 : 2}>
        <Descriptions.Item label="Numéro de compte">
          {bankAccount.accountNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Solde">
          {formatCurrency(bankAccount.balance, company?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Nom">{bankAccount.lastName}</Descriptions.Item>
        <Descriptions.Item label="Postnom">
          {bankAccount.surname || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Prénom">
          {bankAccount.firstName}
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
          <Switch
            checked={bankAccount.blocked}
            loading={updateMutation.isPending}
            onChange={(checked) => { setPendingBlocked(checked); setConfirmOpen(true); }}
            checkedChildren="Bloqué"
            unCheckedChildren="Actif"
          />
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

      <Card
        style={{ borderColor: '#ffccc7', backgroundColor: '#fff2f0', marginTop: 24 }}
        title={<span style={{ color: '#cf1322' }}>Zone danger</span>}
      >
        <p>Supprimer ce compte. Cette action est irréversible.</p>
        <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteOpen(true)}>
          Supprimer
        </Button>
      </Card>

      <BankAccountFormDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        bankAccount={bankAccount}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={`le compte "${bankAccount.accountNumber}"`}
        loading={deleteMutation.isPending}
        warningMessage="Le compte sera définitivement supprimé, y compris ses mouvements et opérations associées. Cette action est irréversible et ne peut pas être annulée une fois effectuée."
      />

      <Modal
        centered
        open={confirmOpen}
        onOk={handleStatusChange}
        onCancel={() => setConfirmOpen(false)}
        okText="Confirmer"
        cancelText="Annuler"
        okButtonProps={{ loading: updateMutation.isPending }}
      >
        <p>
          Voulez-vous {pendingBlocked ? "bloquer" : "activer"} le compte N° {bankAccount.accountNumber} ?
          Cette action peut être annulée à tout moment.
        </p>
      </Modal>
    </div>
  );
}
