"use client";

import { use, useMemo } from "react";
import { Skeleton } from "antd";
import { usePartner } from "@/lib/hooks/use-partners";
import { useCompany } from "@/lib/hooks/use-company";
import { formatCurrency } from "@/lib/utils";
import { DetailTabsHeader } from "@/components/shared/detail-tabs-header";

export default function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: partner, isLoading } = usePartner(id);
  const { data: company } = useCompany();

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!partner) {
    return <div>Partenaire non trouvé</div>;
  }

  const tabs = useMemo(
    () => [
      { key: "transfers", label: "Transferts", path: `/ws/partners/${id}` },
      { key: "details", label: "Détails", path: `/ws/partners/${id}/details` },
    ],
    [id]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 break-words">Partenaire {partner.code}</h1>
        <p className="text-lg text-gray-700 mb-4 break-words">
          {formatCurrency(partner.balance, company?.currency)}
        </p>
        <DetailTabsHeader tabs={tabs} />
      </div>
      {children}
    </div>
  );
}
