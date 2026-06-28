import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "@/components/setup/setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const company = await prisma.company.findFirst();

  if (company) {
    redirect("/login");
  }

  return <SetupForm />;
}
