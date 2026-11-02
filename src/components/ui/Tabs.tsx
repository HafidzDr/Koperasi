import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn("border-b border-ink-200 overflow-x-auto", className)}>
      <nav className="flex space-x-6 min-w-max" aria-label="Tab navigasi">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-3 px-1 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors select-none",
                isActive
                  ? "border-forest-700 text-forest-800"
                  : "border-transparent text-ink-600 hover:text-ink-900 hover:border-ink-300"
              )}
              aria-current={isActive ? "page" : undefined}
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

