import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warm" | "outlined" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-white rounded-lg border border-ink-200 shadow-subtle text-ink-800",
    warm: "bg-ink-100/70 rounded-lg border border-ink-200 text-ink-800",
    outlined: "bg-white rounded-lg border border-ink-300 text-ink-800",
    interactive:
      "bg-white rounded-lg border border-ink-200 shadow-subtle text-ink-800 hover:border-forest-600/40 hover:shadow-md transition-all duration-200 cursor-pointer",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-5 border-b border-ink-100", className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn("text-base font-semibold text-ink-900 leading-tight", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn("text-xs text-ink-600 leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("p-5", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-between p-4 bg-ink-50/60 border-t border-ink-100 rounded-b-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
