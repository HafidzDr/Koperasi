import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  errorMessage?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id: customId, label, description, errorMessage, disabled, ...props }, ref) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="flex flex-col text-left min-w-0">
        <div className="flex items-start gap-2.5 min-w-0">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            className={cn(
              "w-4 h-4 mt-0.5 rounded border-ink-300 text-forest-700 shrink-0 cursor-pointer",
              "focus:ring-2 focus:ring-forest-600 focus:ring-offset-1 focus:ring-offset-white",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError && "border-danger-base text-danger-700",
              className
            )}
            {...props}
          />
          {(label || description) && (
            <div className="text-xs min-w-0">
              {label && (
                <label
                  htmlFor={id}
                  className={cn(
                    "font-medium text-ink-800 cursor-pointer select-none break-words leading-tight",
                    disabled && "cursor-not-allowed text-ink-500"
                  )}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-ink-600 mt-0.5 break-words leading-normal">{description}</p>
              )}
            </div>
          )}
        </div>
        {hasError && (
          <p className="text-xs text-danger-700 font-medium mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
