'use client';

import { use } from "react";
import { useQueryState } from "nuqs";
import { useBankAccount } from "@/lib/hooks/use-bank-accounts";
import { DetailTabsHeader } from "@/components/shared/detail-tabs-header";
import { BankAccountDetail } from "@/components/bank-accounts/bank-account-detail";
import { BankAccountTransactions } from "@/components/bank-accounts/bank-account-transactions";
import { Skeleton } from "antd";

export default function BankAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: bankAccount, isLoading } = useBankAccount(id);
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "transactions",
  });

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!bankAccount) {
    return <div>Compte non trouvé</div>;
  }

  const tabs = [
    { key: "transactions", label: "Transactions" },
    { key: "details", label: "Détails" },
  ];

  return (
    <div>
      <DetailTabsHeader
        title={`Compte ${bankAccount.accountNumber}`}
        tabs={tabs}
        activeKey={activeTab || "transactions"}
        onChange={setActiveTab}
      />
      {activeTab === "transactions" && (
        <BankAccountTransactions accountId={id} />
      )}
      {activeTab === "details" && <BankAccountDetail bankAccount={bankAccount} />}
    </div>
  );
}
