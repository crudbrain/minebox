import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/ws");
  }

  return (
    <div>
      <SettingsTabs />
      <div className="mt-4">{children}</div>
    </div>
  );
}
