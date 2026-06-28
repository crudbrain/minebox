"use client";

import { use } from "react";
import { useBankAccount } from "@/lib/hooks/use-bank-accounts";
import { BankAccountDetail } from "@/components/bank-accounts/bank-account-detail";

export default function BankAccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: bankAccount } = useBankAccount(id);

  return <BankAccountDetail bankAccount={bankAccount} />;
}
