"use client";

import { use, useMemo } from "react";
import { Skeleton } from "antd";
import { useBankAccount } from "@/lib/hooks/use-bank-accounts";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency } from "@/lib/utils";
import { DetailTabsHeader } from "@/components/shared/detail-tabs-header";

export default function BankAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: bankAccount, isLoading } = useBankAccount(id);
  const { data: company } = useCompany();

  const tabs = useMemo(
    () => [
      { key: "transactions", label: "Transactions", path: `/ws/bank-accounts/${id}` },
      { key: "details", label: "Détails", path: `/ws/bank-accounts/${id}/details` },
    ],
    [id]
  );

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!bankAccount) {
    return <div>Compte non trouvé</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1">
          <span className="text-gray-500 text-sm">{bankAccount.accountNumber}</span>
        </div>
        <h1 className="text-2xl font-semibold mb-1">
          {[bankAccount.lastName, bankAccount.surname, bankAccount.firstName].filter(Boolean).join(" ")}
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          {formatCurrency(bankAccount.balance, company?.currency)}
        </p>
        <DetailTabsHeader tabs={tabs} />
      </div>
      {children}
    </div>
  );
}
