'use client';

import { Descriptions, Button, Card } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { useDeletePartner } from "@/lib/hooks/use-partners";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";
import { PartnerFormModal } from "./partner-form-modal";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface PartnerDetailProps {
  partner: any;
}

export function PartnerDetail({ partner }: PartnerDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: company } = useCompany();
  const { isMobile } = useBreakpoint();
  const router = useRouter();
  const deleteMutation = useDeletePartner();

  const handleDelete = () => {
    deleteMutation.mutate(partner.id, {
      onSuccess: () => router.push('/ws/partners'),
    });
  };

  return (
    <div>
      <Descriptions
        bordered
        column={isMobile ? 1 : 2}
        title="Détails du partenaire"
        extra={
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
            Modifier
          </Button>
        }
      >
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

      <Card
        style={{
          borderColor: "#ffccc7",
          backgroundColor: "#fff2f0",
          marginTop: 24,
        }}
        title={<span style={{ color: "#cf1322" }}>Zone danger</span>}
      >
        <p>Supprimer ce partenaire. Cette action est irréversible.</p>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setDeleteOpen(true)}
        >
          Supprimer
        </Button>
      </Card>

      <PartnerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        partner={partner}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName={`le partenaire "${partner.code}"`}
        loading={deleteMutation.isPending}
        warningMessage="Le partenaire sera définitivement supprimé, y compris ses mouvements et opérations associées. Cette action est irréversible et ne peut pas être annulée une fois effectuée."
      />
    </div>
  );
}
