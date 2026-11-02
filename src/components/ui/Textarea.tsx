import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id: customId, label, helperText, errorMessage, disabled, ...props }, ref) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-ink-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError}
          className={cn(
            "w-full p-3 bg-white border rounded-md text-sm text-ink-900 transition-colors min-h-[90px]",
            "border-ink-300 placeholder:text-ink-500",
            "focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
            "disabled:bg-ink-100 disabled:text-ink-500 disabled:cursor-not-allowed",
            hasError && "border-danger-base focus:border-danger-700",
            className
          )}
          {...props}
        />
        {hasError && <p className="text-xs text-danger-700 font-medium">{errorMessage}</p>}
        {!hasError && helperText && <p className="text-xs text-ink-600">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
