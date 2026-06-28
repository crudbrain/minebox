'use client';

import { Card, Statistic } from "antd";
import { BankOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

export default function DashboardPage() {
  const { data: company } = useCompany();
  const { data: stats } = useDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <Card title="Comptes bancaires" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Statistic
              title="Clients"
              value={stats?.bankAccounts?.numberOfAccounts ?? 0}
              prefix={<BankOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Banque"
              value={formatCurrency(
                stats?.bankAccounts?.totalBanck ?? 0,
                company?.currency
              )}
              prefix={<DollarOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Crédits"
              value={formatCurrency(
                stats?.bankAccounts?.totalCredit ?? 0,
                company?.currency
              )}
              prefix={<DollarOutlined />}
            />
          </Card>
        </div>
      </Card>

      <Card title="Partenaires">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Statistic
              title="Partenaires"
              value={stats?.partners?.numberOfPartners ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Crédits"
              value={formatCurrency(
                stats?.partners?.totalPartnersCredit ?? 0,
                company?.currency
              )}
              prefix={<DollarOutlined />}
            />
          </Card>
        </div>
      </Card>
    </div>
  );
}
