export async function getPartners(params: {
  page: number;
  pageSize: number;
  search?: string;
  code?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.search) sp.set("search", params.search);
  if (params.code) sp.set("code", params.code);
  const res = await fetch(`/api/partners?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch partners");
  return res.json();
}

export async function getPartner(id: string) {
  const res = await fetch(`/api/partners/${id}`);
  if (!res.ok) throw new Error("Failed to fetch partner");
  return res.json();
}

export async function createPartner(data: any) {
  const res = await fetch("/api/partners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create partner");
  return res.json();
}

export async function updatePartner(id: string, data: any) {
  const res = await fetch(`/api/partners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update partner");
  return res.json();
}

export async function deletePartner(id: string) {
  const res = await fetch(`/api/partners/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete partner");
  return res.json();
}
