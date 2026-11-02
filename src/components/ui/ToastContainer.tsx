import React from "react";
import { useToastStore, ToastItem } from "@/stores/toastStore";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-success-700 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning-700 shrink-0" />,
    danger: <XCircle className="w-4 h-4 text-danger-700 shrink-0" />,
    info: <Info className="w-4 h-4 text-info-700 shrink-0" />,
  };

  const borderStyles = {
    success: "border-success-base/40 bg-white",
    warning: "border-warning-base/40 bg-white",
    danger: "border-danger-base/40 bg-white",
    info: "border-info-base/40 bg-white",
  };

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-all animate-in slide-in-from-bottom-2",
        borderStyles[toast.type]
      )}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-left min-w-0">
        <h4 className="text-xs font-semibold text-ink-900 leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-0.5 text-xs text-ink-600 leading-normal">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 -mr-1 text-ink-400 hover:text-ink-700 rounded transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
