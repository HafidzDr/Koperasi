import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  initials,
  size = "md",
  className,
  ...props
}) => {
  const getInitials = (n: string) => {
    if (initials) return initials;
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-9 h-9 text-xs font-semibold",
    lg: "w-12 h-12 text-sm font-bold",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-forest-100 text-forest-900 border border-forest-600/30 flex items-center justify-center shrink-0 select-none font-medium",
        sizes[size],
        className
      )}
      title={name}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

