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
    <div className="card-redesign p-3 xl:p-3.5 2xl:p-4">
      <div className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 min-w-0">
        <div className={cn("w-9 h-9 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 rounded-full flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <p className={cn(
          "text-xl xl:text-xl 2xl:text-2xl font-bold whitespace-nowrap flex-shrink-0",
          accentColor === "cyan" ? "text-gradient-cyan" : "text-text-primary"
        )}>
          {displayValue}
        </p>
        <p className="text-xs xl:text-xs 2xl:text-sm text-text-tertiary truncate min-w-0">{label}</p>
        {trend && (
          <p className={cn("flex items-center gap-1 text-xs ml-auto flex-shrink-0 whitespace-nowrap", trendStyle)}>
            <TrendIcon size={12} aria-hidden="true" />
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
