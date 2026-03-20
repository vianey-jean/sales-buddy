import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import SalesChart from "@/components/SalesChart";
import RecentOrders from "@/components/RecentOrders";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold">Gestion des Ventes</h1>
            <p className="text-sm text-muted-foreground">Tableau de bord</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Chiffre d'affaires"
            value="38 500 €"
            change="+12,3% vs mois dernier"
            changeType="up"
            icon={DollarSign}
            delay={0}
          />
          <KpiCard
            title="Commandes"
            value="284"
            change="+8,1% vs mois dernier"
            changeType="up"
            icon={ShoppingCart}
            delay={80}
          />
          <KpiCard
            title="Taux de conversion"
            value="3,7%"
            change="-0,4 pts vs mois dernier"
            changeType="down"
            icon={TrendingUp}
            delay={160}
          />
          <KpiCard
            title="Nouveaux clients"
            value="47"
            change="+15 vs mois dernier"
            changeType="up"
            icon={Users}
            delay={240}
          />
        </div>

        {/* Chart + Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SalesChart />
          </div>
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
