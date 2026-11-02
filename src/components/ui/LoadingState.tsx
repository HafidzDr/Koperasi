import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Memuat data...",
  className,
}) => {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-ink-600 gap-2.5",
        className
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-forest-700" />
      <span className="text-xs font-medium text-ink-700">{message}</span>
    </div>
  );
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-ink-200 rounded", className)}
      {...props}
    />
  );
};

