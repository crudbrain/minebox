"use client";

import { use } from "react";
import { BankAccountTransactions } from "@/components/bank-accounts/bank-account-transactions";

export default function BankAccountTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BankAccountTransactions accountId={id} />;
}
