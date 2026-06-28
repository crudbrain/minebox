'use client';

import { Card, Statistic, List, Typography } from "antd";
import { BankOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import { useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { usePartners } from "@/lib/hooks/use-partners";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

const { Title } = Typography;

export default function DashboardPage() {
  const { data: company } = useCompany();
  const { data: bankAccountsData } = useBankAccounts({
    page: 1,
    pageSize: 1,
  });
  const { data: partnersData } = usePartners({ page: 1, pageSize: 1 });
  const { data: transactionsData } = useTransactions({
    page: 1,
    pageSize: 5,
  });

  const totalBalance =
    bankAccountsData?.data?.reduce(
      (sum: number, acc: any) => sum + (acc.balance || 0),
      0
    ) || 0;

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <Statistic
            title="Comptes bancaires"
            value={bankAccountsData?.total || 0}
            prefix={<BankOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Partenaires"
            value={partnersData?.total || 0}
            prefix={<TeamOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Solde total"
            value={formatCurrency(totalBalance, company?.currency)}
            prefix={<DollarOutlined />}
          />
        </Card>
      </div>

      <Card title="Transactions récentes">
        <List
          dataSource={transactionsData?.data || []}
          renderItem={(item: any) => (
            <List.Item>
              <div className="flex justify-between w-full">
                <span>
                  {item.type} - {item.account?.accountNumber}
                </span>
                <span>{formatCurrency(item.amount, company?.currency)}</span>
                <span>{formatDate(item.date)}</span>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
