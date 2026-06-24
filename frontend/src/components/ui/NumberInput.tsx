"use client";

import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Input from "@/components/ui/Input";
import {
  clampNumber,
  formatNumericDisplay,
  parseNumericInput,
  sanitizeNumericInput,
} from "@/lib/parse-numeric-input";

interface NumberInputProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  min?: number;
  max?: number;
  decimals?: boolean;
  allowEmpty?: boolean;
  onBlur?: () => void;
  className?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  error,
  hint,
  prefix,
  suffix,
  placeholder,
  required,
  disabled,
  id,
  min,
  max,
  decimals = false,
  allowEmpty = false,
  onBlur,
  className,
}: NumberInputProps) {
  const [display, setDisplay] = useState(() => formatNumericDisplay(value));

  useEffect(() => {
    setDisplay(formatNumericDisplay(value));
  }, [value]);

  const commitValue = useCallback(
    (raw: string) => {
      const sanitized = sanitizeNumericInput(raw, { decimals });
      setDisplay(sanitized);

      if (sanitized === "") {
        onChange(allowEmpty ? undefined : 0);
        return;
      }

      const parsed = parseNumericInput(sanitized);
      if (parsed === undefined) {
        onChange(allowEmpty ? undefined : 0);
        return;
      }

      onChange(clampNumber(parsed, min, max));
    },
    [allowEmpty, decimals, max, min, onChange],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitValue(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const parsed = parseNumericInput(sanitizeNumericInput(event.target.value, { decimals }));
    if (parsed !== undefined) {
      const clamped = clampNumber(parsed, min, max);
      setDisplay(formatNumericDisplay(clamped));
      onChange(clamped);
    } else if (allowEmpty) {
      setDisplay("");
      onChange(undefined);
    } else {
      setDisplay(formatNumericDisplay(value));
    }
    onBlur?.();
  };

  return (
    <Input
      label={label}
      id={id}
      type="text"
      inputMode={decimals ? "decimal" : "numeric"}
      autoComplete="off"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      hint={hint}
      prefix={prefix}
      suffix={suffix}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
}
