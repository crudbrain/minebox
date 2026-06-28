export async function getDashboardStats() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}
