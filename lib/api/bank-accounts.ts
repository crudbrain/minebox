export async function getBankAccounts(params: {
  page: number;
  pageSize: number;
  search?: string;
  blocked?: string;
  gender?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.search) sp.set("search", params.search);
  if (params.blocked) sp.set("blocked", params.blocked);
  if (params.gender) sp.set("gender", params.gender);
  const res = await fetch(`/api/bank-accounts?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch bank accounts");
  return res.json();
}

export async function getBankAccount(id: string) {
  const res = await fetch(`/api/bank-accounts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch bank account");
  return res.json();
}

export async function createBankAccount(data: any) {
  const res = await fetch("/api/bank-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bank account");
  return res.json();
}

export async function updateBankAccount(id: string, data: any) {
  const res = await fetch(`/api/bank-accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bank account");
  return res.json();
}

export async function deleteBankAccount(id: string) {
  const res = await fetch(`/api/bank-accounts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete bank account");
  return res.json();
}

export async function generateAccountNumber() {
  const res = await fetch("/api/bank-accounts/generate-account-number");
  if (!res.ok) throw new Error("Failed to generate account number");
  return res.json() as Promise<{ accountNumber: string }>;
}
