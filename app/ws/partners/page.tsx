'use client';

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PartnerTable } from "@/components/partners/partner-table";
import { PartnerFormModal } from "@/components/partners/partner-form-modal";
import { PlusOutlined } from "@ant-design/icons";

export default function PartnersPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Partenaires"
        action={{
          label: "Nouveau partenaire",
          icon: <PlusOutlined />,
          onClick: () => setModalOpen(true),
        }}
      />
      <PartnerTable />
      <PartnerFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
