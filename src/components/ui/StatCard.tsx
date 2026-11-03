import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  badge,
  className,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 flex flex-col justify-between transition-all duration-200 border-ink-200 hover:border-forest-600/40",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{title}</p>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-ink-900 tracking-tight">
            {value}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(description || trend || badge) && (
        <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-xs text-ink-600 flex-wrap gap-2">
          {description && <span className="truncate max-w-[200px]">{description}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium text-xs",
                trend.direction === "up" && "text-forest-700",
                trend.direction === "down" && "text-danger-700",
                trend.direction === "neutral" && "text-ink-500"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === "down" && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
              {trend.label && <span className="text-ink-400 font-normal">{trend.label}</span>}
            </span>
          )}
          {badge && <div>{badge}</div>}
        </div>
      )}
    </Card>
  );
};

