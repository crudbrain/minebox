import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell } from "@/components/ws/workspace-shell";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const company = await prisma.company.findFirst();

  if (!company) {
    redirect("/setup");
  }

  return (
    <WorkspaceShell company={company}>
      {children}
    </WorkspaceShell>
  );
}
