"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
  showRequiredIndicator?: boolean;
  hideLabel?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      hint,
      id,
      className = "",
      required,
      showRequiredIndicator = true,
      hideLabel = false,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const showRequired = required && showRequiredIndicator && !hideLabel;

    return (
      <div className="space-y-1.5">
        {!hideLabel && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
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
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`block w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border focus:border-primary focus:ring-primary/20"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
