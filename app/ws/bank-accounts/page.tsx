'use client';

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { BankAccountTable } from "@/components/bank-accounts/bank-account-table";
import { BankAccountFormModal } from "@/components/bank-accounts/bank-account-form-modal";
import { PlusOutlined } from "@ant-design/icons";

export default function BankAccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Comptes bancaires"
        action={{
          label: "Nouveau compte",
          icon: <PlusOutlined />,
          onClick: () => setModalOpen(true),
        }}
      />
      <BankAccountTable />
      <BankAccountFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
