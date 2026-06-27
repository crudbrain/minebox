'use client';

import { Table, Input, Button, Space } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { usePartners } from "@/lib/hooks/use-partners";
import { formatCurrency } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

export function PartnerTable() {
  const router = useRouter();
  const { data: company } = useCompany();
  const [search, setSearch] = useQueryState("search");
  const [page, setPage] = useQueryState("page", {
    parse: (v) => Math.max(1, Number(v) || 1),
    serialize: String,
  });
  const [pageSize, setPageSize] = useQueryState("pageSize", {
    parse: (v) => Math.max(1, Number(v) || 10),
    serialize: String,
  });

  const currentPage = page || 1;
  const currentPageSize = pageSize || 10;

  const { data, isLoading } = usePartners({
    page: currentPage,
    pageSize: currentPageSize,
    search: search || undefined,
  });

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Solde",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => formatCurrency(balance, company?.currency),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/ws/partners/${record.id}`);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Rechercher..."
          prefix={<SearchOutlined />}
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value || null);
            setPage(1);
          }}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: currentPageSize,
          total: data?.total || 0,
          onChange: (p, ps) => {
            setPage(p);
            if (ps !== currentPageSize) setPageSize(ps);
          },
        }}
        onRow={(record) => ({
          onClick: () => router.push(`/ws/partners/${record.id}`),
          className: "cursor-pointer",
        })}
      />
    </div>
  );
}
