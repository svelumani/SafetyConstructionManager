import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  TrendingDown, 
  TrendingUp, 
  MoveHorizontal, 
  LucideIcon
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "unchanged";
    positive?: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
}: StatsCardProps) {
  // Determine trend icon and color
  const TrendIcon = trend?.direction === "up" 
    ? TrendingUp 
    : trend?.direction === "down" 
      ? TrendingDown 
      : MoveHorizontal;
  
  const trendColor = trend?.positive 
    ? "text-success" 
    : trend?.direction === "unchanged" 
      ? "text-gray-500" 
      : "text-danger";

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-3xl font-bold mt-2 text-primary">{value}</div>
          </div>
          <div className={cn("w-10 h-10 rounded-md flex items-center justify-center text-xl", iconBgColor, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        {trend && (
          <div className={cn("flex items-center gap-1 mt-3 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
