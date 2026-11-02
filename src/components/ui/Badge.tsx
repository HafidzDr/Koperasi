import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "forest";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  ...props
}) => {
  const variants = {
    success: "bg-success-100 text-success-700 border-success-base/30",
    warning: "bg-warning-100 text-warning-700 border-warning-base/30",
    danger: "bg-danger-100 text-danger-700 border-danger-base/30",
    info: "bg-info-100 text-info-700 border-info-base/30",
    neutral: "bg-ink-100 text-ink-700 border-ink-300",
    forest: "bg-forest-100 text-forest-900 border-forest-600/30",
  };

  const dots = {
    success: "bg-success-700",
    warning: "bg-warning-700",
    danger: "bg-danger-700",
    info: "bg-info-700",
    neutral: "bg-ink-600",
    forest: "bg-forest-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium leading-none",
    md: "px-2.5 py-1 text-xs font-semibold leading-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[variant])} />}
      <span>{children}</span>
    </span>
  );
};

