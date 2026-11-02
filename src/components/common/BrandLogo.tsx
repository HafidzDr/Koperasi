import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  variant?: "full" | "icon-only" | "light";
  size?: "sm" | "md" | "lg";
  to?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  to = "/",
  className,
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8 sm:w-9 sm:h-9",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-xs sm:text-sm md:text-base",
    lg: "text-sm sm:text-base md:text-lg",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2 sm:gap-2.5 select-none min-w-0 max-w-full", className)}>
      {/* 2D Flat Geometric Monochromatic Logomark (daun bertaut melingkar) */}
      <div
        className={cn(
          "rounded-md bg-forest-900 flex items-center justify-center shrink-0 p-1.5 shadow-subtle",
          iconSizes[size]
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-forest-100">
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C15.87 4 19.08 6.74 19.82 10.4C17.82 9.57 15.35 9.54 12.89 10.54C10.08 11.69 8.01 14.24 7.23 17.14C5.28 15.83 4 13.57 4 12C4 7.58 7.58 4 12 4ZM9.31 18.48C9.97 15.9 11.75 13.59 14.27 12.56C16.35 11.71 18.43 11.82 20 12.71C19.95 16.73 16.71 19.97 12.69 20C11.5 20 10.35 19.45 9.31 18.48Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {variant !== "icon-only" && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          <span
            className={cn(
              "font-semibold tracking-tight text-ink-900 truncate",
              variant === "light" && "text-white",
              textSizes[size]
            )}
          >
            Koperasi Makmur Bersama
          </span>
          <span
            className={cn(
              "text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-600 font-medium truncate",
              variant === "light" && "text-forest-100/80"
            )}
          >
            Nusantara
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center min-w-0 max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded"
      >
        {content}
      </Link>
    );
  }

  return content;
};

