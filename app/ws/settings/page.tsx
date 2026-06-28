'use client';

import { useState } from "react";
import { Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/shared/page-header";
import { useCompany } from "@/lib/hooks/use-company";
import { CompanyEditDrawer } from "@/components/settings/company-edit-drawer";

export default function SettingsPage() {
  const { data: company, isLoading } = useCompany();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Paramètres"
        action={{
          label: "Modifier",
          icon: <EditOutlined />,
          onClick: () => setDrawerOpen(true),
        }}
      />

      {isLoading ? (
        <div>Chargement...</div>
      ) : company ? (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Code">{company.code}</Descriptions.Item>
          <Descriptions.Item label="Nom">{company.name}</Descriptions.Item>
          <Descriptions.Item label="Nom court">
            {company.shortName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {company.description || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Devise">{company.currency}</Descriptions.Item>
          <Descriptions.Item label="Pays">
            {company.country || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Province">
            {company.province || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ville">
            {company.city || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Adresse">
            {company.address || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Site web">
            {company.webSiteUrl || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Devise">{company.motto || "—"}</Descriptions.Item>
          <Descriptions.Item label="Téléphone 1">
            {company.phone1 || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Téléphone 2">
            {company.phone2 || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {company.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Statut">{company.status}</Descriptions.Item>
        </Descriptions>
      ) : (
        <div>Aucune entreprise trouvée.</div>
      )}

      <CompanyEditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        company={company}
      />
    </div>
  );
}
