export const fieldInputClass = (hasError: boolean, extra = ""): string =>
  [
    "block w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground transition-colors",
    "focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
    hasError
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : "border-border focus:border-primary focus:ring-primary/20",
    extra,
  ]
    .filter(Boolean)
    .join(" ");

export const fieldInputLeftClass = (hasError: boolean, extra = ""): string =>
  fieldInputClass(hasError, `rounded-l-lg rounded-r-none border-r-0 ${extra}`);

export const fieldSelectRightClass = (hasError: boolean) =>
  [
    "rounded-r-lg border bg-foreground/5 px-3 text-sm text-foreground focus:outline-none focus:ring-2",
    hasError
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : "border-border focus:border-primary focus:ring-primary/20",
  ].join(" ");
