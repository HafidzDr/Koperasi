import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      id: customId,
      checked,
      onCheckedChange,
      disabled = false,
      label,
      description,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!disabled) {
          onCheckedChange(!checked);
        }
      }
    };

    return (
      <div className={cn("flex items-start gap-3 text-left min-w-0 select-none", className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-forest-700" : "bg-ink-300"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-subtle ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
        {(label || description) && (
          <div className="text-xs min-w-0 cursor-pointer" onClick={() => !disabled && onCheckedChange(!checked)}>
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
    );
  }
);

Switch.displayName = "Switch";
