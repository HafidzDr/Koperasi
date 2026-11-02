import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-ink-300 rounded-lg",
        className
      )}
    >
      <div className="p-3 bg-ink-100 rounded-full text-ink-600 mb-3">
        {icon || <Inbox className="w-6 h-6 text-ink-600" />}
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-xs text-ink-600 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
