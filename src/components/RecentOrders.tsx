import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "VNT-1847", client: "Marie Lefèvre", montant: 2340, statut: "Payée", date: "19 mars 2026" },
  { id: "VNT-1846", client: "Thomas Dupont", montant: 1580, statut: "En attente", date: "18 mars 2026" },
  { id: "VNT-1845", client: "Sophie Martin", montant: 4210, statut: "Payée", date: "18 mars 2026" },
  { id: "VNT-1844", client: "Lucas Bernard", montant: 890, statut: "Annulée", date: "17 mars 2026" },
  { id: "VNT-1843", client: "Camille Roux", montant: 3150, statut: "Payée", date: "17 mars 2026" },
  { id: "VNT-1842", client: "Antoine Moreau", montant: 1720, statut: "En attente", date: "16 mars 2026" },
];

const statusStyles: Record<string, string> = {
  Payée: "bg-secondary text-success border-0",
  "En attente": "bg-amber-50 text-amber-700 border-0",
  Annulée: "bg-red-50 text-destructive border-0",
};

const RecentOrders = () => {
  return (
    <Card className="animate-fade-in-up shadow-sm" style={{ animationDelay: "400ms" }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3 text-left font-medium">Réf.</th>
                <th className="pb-3 text-left font-medium">Client</th>
                <th className="pb-3 text-right font-medium">Montant</th>
                <th className="pb-3 text-left font-medium pl-4">Statut</th>
                <th className="pb-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3.5 font-medium">{order.id}</td>
                  <td className="py-3.5">{order.client}</td>
                  <td className="py-3.5 text-right tabular-nums font-medium">
                    {order.montant.toLocaleString("fr-FR")} €
                  </td>
                  <td className="py-3.5 pl-4">
                    <Badge variant="secondary" className={statusStyles[order.statut]}>
                      {order.statut}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
