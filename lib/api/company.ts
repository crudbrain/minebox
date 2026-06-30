import { CompanyUpdateInput } from "@/lib/schemas/company";

export async function getCompany() {
  const res = await fetch("/api/company");
  if (!res.ok) throw new Error("Failed to fetch company");
  return res.json();
}

export async function createCompany(data: { company: any; admin: any }) {
  const res = await fetch("/api/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error || "Failed to create company");
    (error as any).details = err.details;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export async function updateCompany(data: CompanyUpdateInput) {
  const res = await fetch("/api/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update company");
  }
  return res.json();
}
