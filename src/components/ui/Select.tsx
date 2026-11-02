import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id: customId,
      label,
      helperText,
      errorMessage,
      options,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-ink-700 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError}
          className={cn(
            "w-full h-10 px-3 bg-white border rounded-md text-sm text-ink-900 transition-colors",
            "border-ink-300 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
            "disabled:bg-ink-100 disabled:text-ink-500 disabled:cursor-not-allowed",
            hasError && "border-danger-base focus:border-danger-700",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && (
          <p className="text-xs text-danger-700 font-medium">{errorMessage}</p>
        )}
        {!hasError && helperText && (
          <p className="text-xs text-ink-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

