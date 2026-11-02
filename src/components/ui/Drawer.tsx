import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = "left",
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-ink-900/60 transition-opacity"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-xs h-full bg-white shadow-md flex flex-col transition-transform",
          side === "left" ? "mr-auto animate-in slide-in-from-left" : "ml-auto animate-in slide-in-from-right"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-ink-100 bg-white">
          <h2 className="text-sm font-semibold text-ink-900">{title || "Menu"}</h2>
          <button
            onClick={onClose}
            className="p-1 text-ink-500 hover:text-ink-800 rounded transition-colors"
            aria-label="Tutup panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};
