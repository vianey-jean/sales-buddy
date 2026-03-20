import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

const KpiCard = ({ title, value, change, changeType, icon: Icon, delay = 0 }: KpiCardProps) => {
  return (
    <Card
      className="animate-fade-in-up shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p
              className={`text-sm font-medium ${
                changeType === "up"
                  ? "text-success"
                  : changeType === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
