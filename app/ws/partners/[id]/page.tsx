"use client";

import { use } from "react";
import { PartnerTransfers } from "@/components/partners/partner-transfers";

export default function PartnerTransfersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PartnerTransfers partnerId={id} />;
}
