'use client';

import { Table, Tag, Input, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { formatCurrency } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { memo, useMemo, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";

interface BankAccountRecord {
  id: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  surname: string;
  phone: string;
  balance: number;
  blocked: boolean;
}

export const BankAccountTable = memo(function BankAccountTable() {
  const router = useRouter();
  const { data: company } = useCompany();
  const [search, setSearch] = useQueryState("search");
  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: (v) => Math.max(1, Number(v) || 1),
    serialize: String,
  });
  const [pageSize, setPageSize] = useQueryState("pageSize", {
    defaultValue: 10,
    parse: (v) => Math.max(1, Number(v) || 10),
    serialize: String,
  });

  const { data, isLoading } = useBankAccounts({
    page: page,
    pageSize: pageSize,
    search: search || undefined,
  });

  const columns = useMemo<ColumnsType<BankAccountRecord>>(
    () => [
      {
        title: "Numéro de compte",
        dataIndex: "accountNumber",
        key: "accountNumber",
      },
      {
        title: "Nom complet",
        key: "fullName",
        render: (_: unknown, record: BankAccountRecord) =>
          [record.lastName, record.surname, record.firstName]
            .filter(Boolean)
            .join(" "),
      },
      {
        title: "Téléphone",
        dataIndex: "phone",
        key: "phone",
      },
      {
        title: "Solde",
        dataIndex: "balance",
        key: "balance",
        align: "right",
        render: (balance: number) => (
          <Typography.Text type={balance >= 0 ? "success" : "danger"}>
            {formatCurrency(balance, company?.currency)}
          </Typography.Text>
        ),
      },
      {
        title: "Statut",
        dataIndex: "blocked",
        key: "blocked",
        render: (blocked: boolean) =>
          blocked ? (
            <Tag color="red">Bloqué</Tag>
          ) : (
            <Tag color="green">Actif</Tag>
          ),
      },
    ],
    [company?.currency]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value || null);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handlePaginationChange = useCallback(
    (p: number, ps: number) => {
      setPage(p);
      if (ps !== pageSize) setPageSize(ps);
    },
    [setPage, setPageSize, pageSize]
  );

  const handleRowClick = useCallback(
    (record: BankAccountRecord) => ({
      onClick: () => router.push(`/ws/bank-accounts/${record.id}`),
      className: "cursor-pointer",
    }),
    [router]
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Rechercher..."
          prefix={<SearchOutlined />}
          value={search || ""}
          onChange={handleSearchChange}
          allowClear
        />
      </div>
      <Table
        size="small"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          onChange: handlePaginationChange,
        }}
        onRow={handleRowClick}
      />
    </div>
  );
});
