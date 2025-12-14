import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface HeroMetricProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function HeroMetric({
  label,
  value,
  change,
  changeLabel,
  className,
}: HeroMetricProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={cn("text-center", className)}>
      <span className="metric-label text-sm">{label}</span>
      
      <div className="mt-4">
        <span className="metric-value text-7xl md:text-8xl font-bold tracking-tighter text-primary glow-primary inline-block">
          {value}
        </span>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <span
            className={cn(
              "flex items-center gap-1 text-lg font-medium",
              isPositive && "trend-up",
              isNegative && "trend-down"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
