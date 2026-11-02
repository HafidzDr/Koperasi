import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id: customId, label, description, disabled, ...props }, ref) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className="flex items-start gap-2.5 text-left">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          disabled={disabled}
          className={cn(
            "w-4 h-4 mt-0.5 rounded border-ink-300 text-forest-700",
            "focus:ring-2 focus:ring-forest-600 focus:ring-offset-1 focus:ring-offset-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <div className="text-xs">
          <label htmlFor={id} className="font-medium text-ink-800 cursor-pointer select-none">
            {label}
          </label>
          {description && <p className="text-ink-600 mt-0.5">{description}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
