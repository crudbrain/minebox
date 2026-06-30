import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateCompanyCode } from "@/lib/server/company";
import { SetupForm } from "@/components/setup/setup-form";

export const metadata: Metadata = { title: "Configuration" };

export default async function SetupPage() {
  const company = await prisma.company.findFirst();

  if (company) {
    redirect("/login");
  }

  const code = await generateCompanyCode();
  if (!code) {
    throw new Error("Failed to generate company code");
  }

  return <SetupForm code={code} />;
}
