import React, { forwardRef, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isTabular?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id: customId,
      type = "text",
      label,
      helperText,
      errorMessage,
      isTabular,
      leftAddon,
      rightAddon,
      showPasswordToggle = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordType = type === "password";
    const resolvedType = isPasswordType && isPasswordVisible ? "text" : type;

    // Default tabular-nums for number inputs if not explicitly specified
    const shouldUseTabular = isTabular ?? (type === "number");

    // Default left icon for search type if not specified
    const effectiveLeftAddon = leftAddon || (type === "search" ? <Search className="w-4 h-4 text-ink-400" /> : null);

    return (
      <div className="w-full min-w-0 space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-ink-700 uppercase tracking-wider break-words"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center min-w-0">
          {effectiveLeftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-500 text-sm shrink-0">
              {effectiveLeftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={resolvedType}
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
              "w-full min-w-0 h-10 px-3 bg-white border rounded-md text-sm text-ink-900 transition-colors",
              "border-ink-300 placeholder:text-ink-500",
              "focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600",
              "disabled:bg-ink-100 disabled:text-ink-500 disabled:cursor-not-allowed",
              hasError && "border-danger-base focus:border-danger-700 focus:ring-danger-base",
              shouldUseTabular && "tabular-nums",
              effectiveLeftAddon && "pl-9",
              (rightAddon || (isPasswordType && showPasswordToggle)) && "pr-9",
              className
            )}
            {...props}
          />
          {isPasswordType && showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 p-0.5 text-ink-500 hover:text-ink-800 transition-colors focus:outline-none"
              aria-label={isPasswordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              tabIndex={-1}
            >
              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : rightAddon ? (
            <div className="absolute right-3 flex items-center pointer-events-none text-ink-500 text-sm shrink-0">
              {rightAddon}
            </div>
          ) : null}
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
