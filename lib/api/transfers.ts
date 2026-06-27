export async function getTransfers(params: {
  page: number;
  pageSize: number;
  partnerId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.partnerId) sp.set("partnerId", params.partnerId);
  if (params.type) sp.set("type", params.type);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  const res = await fetch(`/api/transfers?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch transfers");
  return res.json();
}

export async function createTransfer(data: any) {
  const res = await fetch("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transfer");
  return res.json();
}

export async function updateTransfer(id: string, data: any) {
  const res = await fetch(`/api/transfers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update transfer");
  return res.json();
}

export async function deleteTransfer(id: string) {
  const res = await fetch(`/api/transfers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transfer");
  return res.json();
}
