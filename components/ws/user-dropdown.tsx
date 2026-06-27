'use client';

import { Dropdown, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/use-session";
import { authClient } from "@/lib/auth-client";

export function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const items = [
    {
      key: "name",
      label: session?.user?.name || "Utilisateur",
      disabled: true,
    },
    {
      key: "email",
      label: session?.user?.email || "",
      disabled: true,
    },
    { key: "divider", type: "divider" as const },
    {
      key: "logout",
      label: "Déconnecter",
      onClick: handleSignOut,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="topRight">
      <div className="flex items-center gap-3 cursor-pointer">
        <Avatar icon={<UserOutlined />} />
        <div className="text-sm truncate">
          {session?.user?.name || "Utilisateur"}
        </div>
      </div>
    </Dropdown>
  );
}
