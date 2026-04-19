export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            AM
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">
              Calculadora Inmobiliaria
            </h1>
            <p className="text-xs text-muted">Alexandra Marín Bienes Raíces</p>
          </div>
        </div>
      </div>
    </header>
  );
}
