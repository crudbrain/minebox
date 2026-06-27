'use client';

import { use } from "react";
import { useQueryState } from "nuqs";
import { usePartner } from "@/lib/hooks/use-partners";
import { DetailTabsHeader } from "@/components/shared/detail-tabs-header";
import { PartnerDetail } from "@/components/partners/partner-detail";
import { PartnerTransfers } from "@/components/partners/partner-transfers";
import { Skeleton } from "antd";

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: partner, isLoading } = usePartner(id);
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "transfers",
  });

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!partner) {
    return <div>Partenaire non trouvé</div>;
  }

  const tabs = [
    { key: "transfers", label: "Transferts" },
    { key: "details", label: "Détails" },
  ];

  return (
    <div>
      <DetailTabsHeader
        title={`Partenaire ${partner.code}`}
        tabs={tabs}
        activeKey={activeTab || "transfers"}
        onChange={setActiveTab}
      />
      {activeTab === "transfers" && <PartnerTransfers partnerId={id} />}
      {activeTab === "details" && <PartnerDetail partner={partner} />}
    </div>
  );
}
