import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mois: "Jan", ventes: 12400 },
  { mois: "Fév", ventes: 18200 },
  { mois: "Mar", ventes: 15800 },
  { mois: "Avr", ventes: 23100 },
  { mois: "Mai", ventes: 19600 },
  { mois: "Jun", ventes: 27400 },
  { mois: "Jul", ventes: 24800 },
  { mois: "Aoû", ventes: 31200 },
  { mois: "Sep", ventes: 28900 },
  { mois: "Oct", ventes: 34100 },
  { mois: "Nov", ventes: 29700 },
  { mois: "Déc", ventes: 38500 },
];

const SalesChart = () => {
  return (
    <Card className="animate-fade-in-up shadow-sm" style={{ animationDelay: "300ms" }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Chiffre d'affaires mensuel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 90%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 45%)" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(160, 10%, 45%)"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString("fr-FR")} €`, "Ventes"]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(150, 10%, 90%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="ventes"
                stroke="hsl(158, 64%, 32%)"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
