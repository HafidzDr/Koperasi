import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isTabular?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id: customId,
      label,
      helperText,
      errorMessage,
      isTabular = false,
      leftAddon,
      rightAddon,
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
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-500 text-sm">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${id}-error`
                : helperText
                ? `${id}-helper`
                : undefined
            }
            className={cn(
              "w-full h-10 px-3 bg-white border rounded-md text-sm text-ink-900 transition-colors",
              "border-ink-300 placeholder:text-ink-500",
              "focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
              "disabled:bg-ink-100 disabled:text-ink-500 disabled:cursor-not-allowed",
              hasError && "border-danger-base focus:border-danger-700 focus:ring-danger-base",
              isTabular && "tabular-nums",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-ink-500 text-sm">
              {rightAddon}
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${id}-error`} className="text-xs text-danger-700 font-medium">
            {errorMessage}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${id}-helper`} className="text-xs text-ink-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

