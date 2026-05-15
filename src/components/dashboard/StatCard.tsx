import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor: "cyan" | "copper" | "neutral";
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
}

export function StatCard({ label, value, icon: Icon, accentColor, trend }: StatCardProps) {
  const iconBg = {
    cyan: "bg-accent-light text-accent",
    copper: "bg-gradient-to-br from-copper-brand/20 to-copper-brand/5 text-copper-brand",
    neutral: "bg-bg-hover text-text-secondary",
  }[accentColor];

  const displayValue =
    typeof value === "number" && value > 999
      ? value.toLocaleString("sr-RS")
      : value;

  const TrendIcon =
    trend?.direction === "up" ? TrendingUp
    : trend?.direction === "down" ? TrendingDown
    : Minus;

  const trendStyle =
    trend?.direction === "up" ? "text-status-success"
    : trend?.direction === "down" ? "text-status-error"
    : "text-text-tertiary";

  return (
    <div className="card-redesign p-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <p className={cn(
          "text-2xl font-bold font-mono",
          accentColor === "cyan" ? "text-gradient-cyan" : "text-text-primary"
        )}>
          {displayValue}
        </p>
        <p className="text-sm text-text-tertiary truncate">{label}</p>
        {trend && (
          <p className={cn("flex items-center gap-1 text-xs ml-auto flex-shrink-0", trendStyle)}>
            <TrendIcon size={12} aria-hidden="true" />
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
