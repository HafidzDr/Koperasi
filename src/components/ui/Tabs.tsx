import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = "underline",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    }
  };

  if (variant === "pills") {
    return (
      <div className={cn("overflow-x-auto p-1 bg-ink-100 rounded-lg inline-flex", className)}>
        <nav className="flex space-x-1 min-w-max" role="tablist" aria-label="Tab navigasi">
          {tabs.map((tab, idx) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={cn(
                  "py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors select-none",
                  isActive
                    ? "bg-white text-forest-900 shadow-subtle border border-ink-200/60"
                    : "text-ink-600 hover:text-ink-900 hover:bg-white/50",
                  tab.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] tabular-nums leading-none",
                      isActive
                        ? "bg-forest-100 text-forest-900 font-bold"
                        : "bg-ink-200 text-ink-700"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={cn("border-b border-ink-200 overflow-x-auto", className)}>
      <nav className="flex space-x-6 min-w-max" role="tablist" aria-label="Tab navigasi">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "py-3 px-1 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors select-none",
                isActive
                  ? "border-forest-700 text-forest-800"
                  : "border-transparent text-ink-600 hover:text-ink-900 hover:border-ink-300",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] tabular-nums leading-none",
                    isActive
                      ? "bg-forest-100 text-forest-900 font-bold"
                      : "bg-ink-100 text-ink-600"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
