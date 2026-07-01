'use client';

import { Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { usePartners } from "@/lib/hooks/use-partners";
import { formatCurrency } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";
import { memo, useMemo, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";

interface PartnerRecord {
  id: string;
  code: string;
  balance: number;
}

export const PartnerTable = memo(function PartnerTable() {
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

  const { data, isLoading } = usePartners({
    page: page,
    pageSize: pageSize,
    search: search || undefined,
  });

  const columns = useMemo<ColumnsType<PartnerRecord>>(
    () => [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "Solde",
        dataIndex: "balance",
        key: "balance",
        align: "right",
        render: (balance: number) => formatCurrency(balance, company?.currency),
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
    (record: PartnerRecord) => ({
      onClick: () => router.push(`/ws/partners/${record.id}`),
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
        scroll={{ x: 600 }}
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
