import { cn } from "@/lib/utils";

interface SparkIndicatorProps {
  label: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  className?: string;
}

const statusColors: Record<string, string> = {
  healthy: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

export function SparkIndicator({
  label,
  value,
  status,
  className,
}: SparkIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-display font-medium text-foreground ml-auto">{value}</span>
    </div>
  );
}
