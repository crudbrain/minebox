import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/login/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const company = await prisma.company.findFirst();

  if (session) {
    if (company) {
      redirect("/ws");
    } else {
      redirect("/setup");
    }
  }

  if (!company) {
    redirect("/setup");
  }

  return <LoginForm hasCompany={!!company} />;
}
