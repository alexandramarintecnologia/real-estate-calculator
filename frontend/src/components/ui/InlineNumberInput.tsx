"use client";

import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { fieldInputLeftClass } from "@/lib/field-classes";
import {
  clampNumber,
  formatNumericDisplay,
  parseNumericInput,
  sanitizeNumericInput,
} from "@/lib/parse-numeric-input";

interface InlineNumberInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  hasError?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  decimals?: boolean;
  allowEmpty?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export default function InlineNumberInput({
  value,
  onChange,
  onBlur,
  hasError = false,
  placeholder,
  min,
  max,
  decimals = false,
  allowEmpty = false,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: InlineNumberInputProps) {
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
    <input
      id={id}
      type="text"
      inputMode={decimals ? "decimal" : "numeric"}
      autoComplete="off"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className={fieldInputLeftClass(hasError)}
    />
  );
}
