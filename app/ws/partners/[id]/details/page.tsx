"use client";

import { use } from "react";
import { usePartner } from "@/lib/hooks/use-partners";
import { PartnerDetail } from "@/components/partners/partner-detail";

export default function PartnerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: partner } = usePartner(id);

  return <PartnerDetail partner={partner} />;
}
