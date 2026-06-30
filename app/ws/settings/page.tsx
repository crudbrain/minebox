'use client';

import { useState } from "react";
import { Descriptions, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useCompany } from "@/lib/hooks/use-company";
import { CompanyEditDrawer } from "@/components/settings/company-edit-drawer";

import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

export default function SettingsPage() {
  const { data: company, isLoading } = useCompany();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  return (
    <div>
      {isLoading ? (
        <div>Chargement...</div>
      ) : company ? (
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          title="Informations sur l'entreprise"
          extra={
            <Button
              icon={<EditOutlined />}
              onClick={() => setDrawerOpen(true)}
              type="text"
            />
          }
        >
          <Descriptions.Item label="Code">{company.code}</Descriptions.Item>
          <Descriptions.Item label="Nom">{company.name}</Descriptions.Item>
          <Descriptions.Item label="Nom court">
            {company.shortName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {company.description || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Devise">
            {company.currency}
          </Descriptions.Item>
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
          <Descriptions.Item label="Devise">
            {company.motto || "—"}
          </Descriptions.Item>
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
