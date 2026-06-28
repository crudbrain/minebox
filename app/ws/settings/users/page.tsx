'use client';

import { useState } from "react";
import {
  Table,
  Button,
  Dropdown,
  Tag,
  message,
  Modal,
  Drawer,
  List,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  LogoutOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  UserSwitchOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { authClient } from "@/lib/auth-client";
import { UserCreateDrawer } from "@/components/settings/user-create-drawer";
import { UserEditDrawer } from "@/components/settings/user-edit-drawer";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  emailVerified: boolean;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt: Date;
}

export default function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [sessionsUser, setSessionsUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: { limit: 100 },
      });
      return res.data;
    },
  });

  const users = usersData?.users || [];

  const handleSetRole = async (userId: string, role: "admin" | "user") => {
    try {
      await authClient.admin.setRole({
        userId,
        role,
      });
      message.success(`Rôle mis à jour : ${role}`);
      refetch();
    } catch (error: any) {
      message.error(error.message || "Erreur lors de la mise à jour du rôle");
    }
  };

  const handleBan = async (userId: string) => {
    Modal.confirm({
      title: "Bannir l'utilisateur",
      content: (
        <div className="mt-2">
          <p>Motif du bannissement :</p>
          <input
            id="ban-reason"
            className="w-full mt-1 p-2 border rounded"
            placeholder="Motif..."
          />
        </div>
      ),
      onOk: async () => {
        const reason = (document.getElementById("ban-reason") as HTMLInputElement)?.value;
        try {
          await authClient.admin.banUser({
            userId,
            banReason: reason || undefined,
          });
          message.success("Utilisateur banni");
          refetch();
        } catch (error: any) {
          message.error(error.message || "Erreur lors du bannissement");
        }
      },
    });
  };

  const handleUnban = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId });
      message.success("Utilisateur débanni");
      refetch();
    } catch (error: any) {
      message.error(error.message || "Erreur lors du débannissement");
    }
  };

  const handleSetPassword = async (userId: string) => {
    Modal.confirm({
      title: "Définir un nouveau mot de passe",
      content: (
        <div className="mt-2">
          <p>Nouveau mot de passe :</p>
          <input
            id="new-password"
            type="password"
            className="w-full mt-1 p-2 border rounded"
            placeholder="Nouveau mot de passe..."
          />
        </div>
      ),
      onOk: async () => {
        const password = (document.getElementById("new-password") as HTMLInputElement)?.value;
        if (!password) {
          message.error("Mot de passe requis");
          return Promise.reject();
        }
        try {
          await authClient.admin.setUserPassword({
            userId,
            newPassword: password,
          });
          message.success("Mot de passe mis à jour");
        } catch (error: any) {
          message.error(error.message || "Erreur lors de la mise à jour du mot de passe");
          return Promise.reject();
        }
      },
    });
  };

  const handleRevokeSessions = async (userId: string) => {
    Modal.confirm({
      title: "Révoquer toutes les sessions",
      content: "Cela déconnectera l'utilisateur de tous ses appareils. Continuer ?",
      onOk: async () => {
        try {
          await authClient.admin.revokeUserSessions({ userId });
          message.success("Sessions révoquées");
        } catch (error: any) {
          message.error(error.message || "Erreur lors de la révocation");
        }
      },
    });
  };

  const handleImpersonate = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({ userId });
      message.success("Impersonification réussie");
      window.location.href = "/ws";
    } catch (error: any) {
      message.error(error.message || "Erreur lors de l'impersonification");
    }
  };

  const handleDelete = (userId: string) => {
    setDeleteUserId(userId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    setDeleteLoading(true);
    try {
      await authClient.admin.removeUser({ userId: deleteUserId });
      message.success("Utilisateur supprimé");
      refetch();
    } catch (error: any) {
      message.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
      setDeleteUserId(null);
    }
  };

  const handleViewSessions = async (user: User) => {
    setSessionsUser(user);
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      render: (role?: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>{role || "user"}</Tag>
      ),
    },
    {
      title: "Vérifié",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (verified: boolean) =>
        verified ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Oui</Tag>
        ) : (
          <Tag color="orange">Non</Tag>
        ),
    },
    {
      title: "Banni",
      dataIndex: "banned",
      key: "banned",
      render: (banned: boolean | null, record: User) =>
        banned ? (
          <Tag color="red" icon={<StopOutlined />}>
            {record.banReason || "Banni"}
          </Tag>
        ) : (
          <Tag color="default">Non</Tag>
        ),
    },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => date.toLocaleDateString("fr-FR"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => {
        const items = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Modifier",
            onClick: () => setEditUser(record),
          },
          {
            key: "role-admin",
            icon: <SafetyCertificateOutlined />,
            label: (record.role || "user") === "admin" ? "Rétrograder en user" : "Promouvoir admin",
            onClick: () =>
              handleSetRole(record.id, (record.role || "user") === "admin" ? "user" : "admin"),
          },
          {
            key: "password",
            icon: <KeyOutlined />,
            label: "Définir mot de passe",
            onClick: () => handleSetPassword(record.id),
          },
          record.banned
            ? {
                key: "unban",
                icon: <CheckCircleOutlined />,
                label: "Débannir",
                onClick: () => handleUnban(record.id),
              }
            : {
                key: "ban",
                icon: <StopOutlined />,
                label: "Bannir",
                onClick: () => handleBan(record.id),
              },
          {
            key: "sessions",
            icon: <EyeOutlined />,
            label: "Voir sessions",
            onClick: () => handleViewSessions(record),
          },
          {
            key: "revoke",
            icon: <LogoutOutlined />,
            label: "Révoquer sessions",
            onClick: () => handleRevokeSessions(record.id),
          },
          {
            key: "impersonate",
            icon: <UserSwitchOutlined />,
            label: "Impersonifier",
            onClick: () => handleImpersonate(record.id),
          },
          { key: "divider", type: "divider" as const },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Supprimer",
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}
            arrow>
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        action={{
          label: "Créer un utilisateur",
          icon: <PlusOutlined />,
          onClick: () => setCreateOpen(true),
        }}
      />

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <UserCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      <UserEditDrawer
        open={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onSuccess={() => {
          setEditUser(null);
          refetch();
        }}
      />

      <ConfirmDeleteModal
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleConfirmDelete}
        entityName="cet utilisateur"
        loading={deleteLoading}
      />

      <Drawer
        title={`Sessions de ${sessionsUser?.name || ""}`}
        width={480}
        open={!!sessionsUser}
        onClose={() => setSessionsUser(null)}
      >
        <UserSessions userId={sessionsUser?.id} />
      </Drawer>
    </div>
  );
}

function UserSessions({ userId }: { userId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-sessions", userId],
    queryFn: async () => {
      if (!userId) return { sessions: [] };
      const res = await authClient.admin.listUserSessions({ userId });
      return res.data;
    },
    enabled: !!userId,
  });

  if (isLoading) return <div>Chargement...</div>;

  const sessions = data?.sessions || [];

  if (sessions.length === 0) {
    return <div>Aucune session active.</div>;
  }

  return (
    <List
      dataSource={sessions}
      renderItem={(session: any) => (
        <List.Item>
          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Token">{session.token.slice(0, 16)}...</Descriptions.Item>
            <Descriptions.Item label="IP">{session.ipAddress || "—"}</Descriptions.Item>
            <Descriptions.Item label="User Agent">
              {session.userAgent || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Expire le">
              {new Date(session.expiresAt).toLocaleString("fr-FR")}
            </Descriptions.Item>
            {session.impersonatedBy && (
              <Descriptions.Item label="Impersonifié par">
                {session.impersonatedBy}
              </Descriptions.Item>
            )}
          </Descriptions>
        </List.Item>
      )}
    />
  );
}
