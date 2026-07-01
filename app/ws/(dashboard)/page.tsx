'use client';

import { BankOutlined, TeamOutlined, DollarOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { useCompany } from "@/lib/hooks/use-company";

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  colorClass: string;
}

function StatTile({ icon, label, value, colorClass }: StatTileProps) {
  return (
    <div className="bg-bg-elevated border border-border-secondary rounded-md p-4 hover:border-primary transition-colors">
      <span className={`${colorClass} text-base block mb-3`}>{icon}</span>
      <div className={`text-2xl font-semibold ${colorClass}`}>{value}</div>
      <div className="text-sm text-foreground/60">{label}</div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  href: string;
}

function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link
        href={href}
        className="text-primary text-sm flex items-center gap-1 hover:underline"
      >
        Voir tout <RightOutlined />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { data: company } = useCompany();
  const { data: stats } = useDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <section>
        <SectionHeader title="Comptes" href="/ws/bank-accounts" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile
            icon={<BankOutlined />}
            label="Clients"
            value={stats?.bankAccounts?.numberOfAccounts ?? 0}
            colorClass="text-stat-blue"
          />
          <StatTile
            icon={<DollarOutlined />}
            label="Banque"
            value={formatCurrency(
              stats?.bankAccounts?.totalBanck ?? 0,
              company?.currency
            )}
            colorClass="text-stat-green"
          />
          <StatTile
            icon={<DollarOutlined />}
            label="Crédits"
            value={formatCurrency(
              stats?.bankAccounts?.totalCredit ?? 0,
              company?.currency
            )}
            colorClass="text-stat-amber"
          />
        </div>
      </section>

      <div className="h-px bg-border-secondary my-6" />

      <section>
        <SectionHeader title="Partenaires" href="/ws/partners" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile
            icon={<TeamOutlined />}
            label="Partenaires"
            value={stats?.partners?.numberOfPartners ?? 0}
            colorClass="text-stat-lavender"
          />
          <StatTile
            icon={<DollarOutlined />}
            label="Crédits"
            value={formatCurrency(
              stats?.partners?.totalPartnersCredit ?? 0,
              company?.currency
            )}
            colorClass="text-stat-rose"
          />
        </div>
      </section>
    </div>
  );
}
