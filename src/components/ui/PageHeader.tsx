import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { Badge, BadgeProps } from "./Badge";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: {
    text: string;
    variant?: BadgeProps["variant"];
    dot?: boolean;
  };
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  backTo,
  actions,
  className,
}) => {
  return (
    <div className={cn("space-y-2 mb-6 pb-4 border-b border-ink-100", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-2" />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center text-xs font-medium text-forest-700 hover:text-forest-800 mb-1 transition-colors gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          )}
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight leading-snug">
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || "forest"} dot={badge.dot} size="sm">
                {badge.text}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap sm:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
