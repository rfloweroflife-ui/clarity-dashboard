import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  size?: "default" | "large";
  className?: string;
  highlight?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  size = "default",
  className,
  highlight = false,
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "glass-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-muted-foreground/20",
        highlight && "glow-primary border-primary/20",
        className
      )}
    >
      <span className="metric-label">{label}</span>
      
      <div className="mt-3">
        <span
          className={cn(
            "metric-value font-semibold leading-none",
            size === "large" ? "text-5xl" : "text-3xl"
          )}
        >
          {value}
        </span>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                isPositive && "trend-up",
                isNegative && "trend-down"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground text-sm">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
