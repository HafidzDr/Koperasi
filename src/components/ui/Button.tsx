import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "neutral" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap shrink-0";

    const variants = {
      primary:
        "bg-forest-700 text-white hover:bg-forest-800 active:bg-forest-900 border border-transparent shadow-subtle",
      secondary:
        "bg-white text-forest-700 hover:bg-forest-50 active:bg-forest-100 border border-forest-600 shadow-subtle",
      outline:
        "bg-white text-forest-700 border border-forest-600 hover:bg-forest-50 active:bg-forest-100",
      neutral:
        "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 border border-ink-300",
      ghost:
        "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 border border-transparent",
      danger:
        "bg-danger-700 text-white hover:bg-danger-base active:bg-danger-800 border border-transparent shadow-subtle",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
