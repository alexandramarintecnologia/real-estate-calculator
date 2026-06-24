"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  showRequiredIndicator?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      id,
      className = "",
      required,
      showRequiredIndicator = true,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const showRequired = required && showRequiredIndicator;

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
          {showRequired && (
            <>
              <span className="text-danger" aria-hidden="true">
                {" "}
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </>
          )}
        </label>
        <div className="relative flex items-stretch">
          {prefix && (
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-foreground/5 px-3 text-sm text-muted">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            onBlur={onBlur}
            className={`block w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              prefix ? "rounded-l-none" : ""
            } ${suffix ? "rounded-r-none" : ""} ${
              error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border focus:border-primary focus:ring-primary/20"
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {suffix && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-border bg-foreground/5 px-3 text-sm text-muted">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
