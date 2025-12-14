import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AttentionItemProps {
  type: "warning" | "critical" | "opportunity";
  title: string;
  metric: string;
  description: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  warning: AlertTriangle,
  critical: TrendingDown,
  opportunity: DollarSign,
};

const colorMap: Record<string, string> = {
  warning: "text-warning border-warning/30 bg-warning/5",
  critical: "text-destructive border-destructive/30 bg-destructive/5",
  opportunity: "text-success border-success/30 bg-success/5",
};

export function AttentionItem({
  type,
  title,
  metric,
  description,
  className,
}: AttentionItemProps) {
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "glass-card p-5 flex items-start gap-4 transition-all duration-300",
        colorMap[type],
        className
      )}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5 pulse-glow" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <span className="font-display font-semibold text-lg shrink-0">{metric}</span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}
