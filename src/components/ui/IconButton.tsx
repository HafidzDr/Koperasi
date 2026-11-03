import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      isLoading = false,
      disabled,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none shrink-0";

    const variants = {
      primary:
        "bg-forest-700 text-white hover:bg-forest-800 active:bg-forest-900 border border-transparent shadow-subtle",
      secondary:
        "bg-white text-forest-700 hover:bg-forest-50 active:bg-forest-100 border border-forest-600 shadow-subtle",
      outline:
        "bg-white text-forest-700 border border-forest-600 hover:bg-forest-50 active:bg-forest-100",
      ghost:
        "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 border border-transparent",
      danger:
        "bg-danger-700 text-white hover:bg-danger-base active:bg-danger-800 border border-transparent shadow-subtle",
    };

    const sizes = {
      sm: "h-8 w-8 text-xs p-1",
      md: "h-10 w-10 text-sm p-2",
      lg: "h-12 w-12 text-base p-2.5",
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" /> : children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

