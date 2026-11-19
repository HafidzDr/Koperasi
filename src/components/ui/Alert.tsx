import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger" | "forest";
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  icon,
  onClose,
  className,
  children,
  ...props
}) => {
  const defaultIcons = {
    info: <Info className="w-4 h-4 text-info-700 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-success-700 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning-700 shrink-0" />,
    danger: <XCircle className="w-4 h-4 text-danger-700 shrink-0" />,
    forest: <Info className="w-4 h-4 text-forest-700 shrink-0" />,
  };

  const variants = {
    info: "bg-info-100/70 border-info-base/30 text-info-700",
    success: "bg-success-100/70 border-success-base/30 text-success-700",
    warning: "bg-warning-100/70 border-warning-base/30 text-warning-700",
    danger: "bg-danger-100/70 border-danger-base/30 text-danger-700",
    forest: "bg-forest-100/70 border-forest-600/30 text-forest-900",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border text-xs leading-relaxed text-left",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{icon || defaultIcons[variant]}</div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold text-xs mb-0.5">{title}</h5>}
        <div className="text-ink-700 font-normal">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 text-ink-500 hover:text-ink-800 rounded transition-colors focus-visible:ring-2 focus-visible:ring-forest-600"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
