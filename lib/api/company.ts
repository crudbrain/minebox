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
  if (!res.ok) throw new Error("Failed to create company");
  return res.json();
}
