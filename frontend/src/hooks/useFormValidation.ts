"use client";

import { useCallback, useMemo, useState } from "react";

type FieldErrors<T extends string> = Partial<Record<T, string>>;

interface UseFormValidationOptions<T extends string> {
  fields: T[];
  getErrors: () => FieldErrors<T>;
}

export function useFormValidation<T extends string>({
  fields,
  getErrors,
}: UseFormValidationOptions<T>) {
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<T, boolean>>>({});

  const errors = useMemo(() => getErrors(), [getErrors]);

  const touch = useCallback((field: T) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const shouldShowError = useCallback(
    (field: T) => submitted || Boolean(touched[field]),
    [submitted, touched],
  );

  const getError = useCallback(
    (field: T) => (shouldShowError(field) ? errors[field] : undefined),
    [errors, shouldShowError],
  );

  const validateAll = useCallback(() => {
    setSubmitted(true);
    setTouched((prev) => {
      const next = { ...prev };
      for (const field of fields) next[field] = true;
      return next;
    });
    return Object.keys(getErrors()).length === 0;
  }, [fields, getErrors]);

  const resetValidation = useCallback(() => {
    setSubmitted(false);
    setTouched({});
  }, []);

  const firstInvalidField = useMemo(
    () => fields.find((field) => errors[field]),
    [errors, fields],
  );

  return {
    errors,
    getError,
    touch,
    validateAll,
    resetValidation,
    submitted,
    hasErrors: Object.keys(errors).length > 0,
    firstInvalidField,
  };
}
