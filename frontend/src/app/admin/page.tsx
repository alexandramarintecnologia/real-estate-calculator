"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Pagination from "@/components/ui/Pagination";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BulkImportModal from "@/components/admin/BulkImportModal";
import { apiClient } from "@/lib/api-client";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  AuthUser,
  BulkImportResult,
  CreateUserPayload,
  PaginatedUsers,
  UpdateUserPayload,
  UserRole,
  UsersStats,
  UserStatusFilter,
} from "@/types/auth.types";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}

const TIME_ZONE = "America/Bogota";

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin límite";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-CO", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toInputDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !day) return "";
  return `${y}-${m}-${day}`;
}

function toEndOfDayIsoColombia(dateInput: string): string {
  return `${dateInput}T23:59:59.999-05:00`;
}

function getUserStatus(user: AuthUser, now = new Date()): Exclude<UserStatusFilter, "all"> {
  if (!user.isActive) return "disabled";
  if (user.expiresAt) {
    const expiresDate = new Date(user.expiresAt);
    if (expiresDate <= now) return "expired";
    
    const fifteenDaysFromNow = new Date(now);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
    if (expiresDate <= fifteenDaysFromNow) return "expiring_soon";
  }
  return "active";
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback abajo
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function AdminContent() {
  const [paginated, setPaginated] = useState<PaginatedUsers | null>(null);
  const [stats, setStats] = useState<UsersStats>({
    total: 0,
    active: 0,
    expired: 0,
    disabled: 0,
    expiringSoon: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 350);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const data = await apiClient.get<PaginatedUsers>(`/users?${params.toString()}`);
      setPaginated(data);

      // Si el admin borró/creó y la página actual ya no existe, retrocedemos.
      if (data.page > data.totalPages) {
        setPage(data.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const s = await apiClient.get<UsersStats>("/users/stats");
      setStats(s);
    } catch {
      // Silencio: las stats son informativas, un fallo no debe bloquear la UI.
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Volver a la página 1 cuando cambia búsqueda o filtro.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const notify = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 7000);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadUsers(), loadStats()]);
  }, [loadUsers, loadStats]);

  const handleCreated = useCallback(
    async (email?: string) => {
      setShowCreate(false);
      if (email) {
        const copied = await copyToClipboard(email);
        notify(
          copied
            ? `Usuario creado. El email se copió al portapapeles; compártelo con ${email} para que cree su contraseña al iniciar sesión.`
            : `Usuario creado. Comparte el email ${email} para que cree su contraseña al iniciar sesión.`,
        );
      } else {
        notify("Usuario creado correctamente");
      }
      await refreshAll();
    },
    [notify, refreshAll],
  );

  const handleUpdated = useCallback(async () => {
    setEditingUser(null);
    notify("Usuario actualizado correctamente");
    await refreshAll();
  }, [notify, refreshAll]);

  const handleImported = useCallback(
    async (result: BulkImportResult) => {
      setShowImport(false);
      const parts = [`${result.created} usuario(s) creado(s)`];
      if (result.skippedExisting > 0) {
        parts.push(`${result.skippedExisting} omitido(s) por ya existir`);
      }
      if (result.skippedDuplicate > 0) {
        parts.push(`${result.skippedDuplicate} duplicado(s) en el archivo`);
      }
      notify(`Importación completada: ${parts.join(", ")}.`);
      await refreshAll();
    },
    [notify, refreshAll],
  );

  const handleDelete = useCallback(
    async (user: AuthUser) => {
      if (!confirm(`¿Eliminar al usuario ${user.email}?`)) return;
      try {
        await apiClient.delete(`/users/${user.id}`);
        notify("Usuario eliminado");
        await refreshAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error eliminando usuario");
      }
    },
    [notify, refreshAll],
  );

  const handleResetPassword = useCallback(
    async (user: AuthUser) => {
      const confirmMsg = `¿Resetear la contraseña de ${user.email}?\n\nEl usuario tendrá que crear una nueva contraseña en su próximo inicio de sesión.`;
      if (!confirm(confirmMsg)) return;
      try {
        await apiClient.post(`/users/${user.id}/reset-password`, {});
        notify("Contraseña reseteada. El usuario deberá crearla al iniciar sesión.");
        await refreshAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error reseteando contraseña");
      }
    },
    [notify, refreshAll],
  );

  const users = paginated?.data ?? [];
  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== "all";
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const headerDescription = useMemo(() => {
    if (!paginated) return "Listado de cuentas registradas";
    if (hasActiveFilters) {
      return `${paginated.total} coincidencia${paginated.total === 1 ? "" : "s"} encontrada${paginated.total === 1 ? "" : "s"}`;
    }
    return `${paginated.total} cuenta${paginated.total === 1 ? "" : "s"} registrada${paginated.total === 1 ? "" : "s"}`;
  }, [paginated, hasActiveFilters]);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Panel de administración</h2>
            <p className="mt-1 text-sm text-muted">
              Gestiona los usuarios que tienen acceso a la calculadora y sus tiempos de vigencia.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>
              Importar CSV
            </Button>
            <Button onClick={() => setShowCreate(true)}>+ Nuevo usuario</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total usuarios"
            value={stats.total}
            tone="default"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            label="Activos"
            value={stats.active}
            tone="success"
            active={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
          />
          <StatCard
            label="Próximos a expirar"
            value={stats.expiringSoon}
            tone="warning"
            active={statusFilter === "expiring_soon"}
            onClick={() => setStatusFilter("expiring_soon")}
          />
          <StatCard
            label="Expirados"
            value={stats.expired}
            tone="danger"
            active={statusFilter === "expired"}
            onClick={() => setStatusFilter("expired")}
          />
          <StatCard
            label="Desactivados"
            value={stats.disabled}
            tone="muted"
            active={statusFilter === "disabled"}
            onClick={() => setStatusFilter("disabled")}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
            {successMsg}
          </div>
        )}

        <Card className="mt-6" title="Usuarios" description={headerDescription}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por email o nombre..."
                className="block w-full rounded-lg border border-border bg-card py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-foreground/5 hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-52"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="expiring_soon">Próximos a expirar</option>
              <option value="expired">Solo expirados</option>
              <option value="disabled">Solo desactivados</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-card-hover"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {isLoading && !paginated ? (
            <p className="text-sm text-muted">Cargando...</p>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                {hasActiveFilters
                  ? "No encontramos usuarios con esos criterios"
                  : "No hay usuarios aún"}
              </p>
              {hasActiveFilters && (
                <>
                  <p className="text-xs text-muted">
                    Revisa el texto de búsqueda o cambia el filtro de estado.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div
                className={`overflow-x-auto transition-opacity ${isLoading ? "opacity-60" : "opacity-100"}`}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-3 pr-3">Usuario</th>
                      <th className="py-3 pr-3">Rol</th>
                      <th className="py-3 pr-3">Estado</th>
                      <th className="py-3 pr-3">Expira</th>
                      <th className="py-3 pr-3">Último ingreso</th>
                      <th className="py-3 pr-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const status = getUserStatus(u);
                      return (
                        <tr key={u.id} className="border-b border-border/60 last:border-0">
                          <td className="py-3 pr-3">
                            <div className="font-medium text-foreground">{u.fullName}</div>
                            <div className="text-xs text-muted">{u.email}</div>
                            {u.phone && <div className="text-xs text-muted/80">{u.phone}</div>}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-foreground/5 text-foreground"
                              }`}
                            >
                              {u.role === "admin" ? "Admin" : "Estudiante"}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {status === "disabled" ? (
                                <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                                  Desactivado
                                </span>
                              ) : status === "expired" ? (
                                <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                                  Expirado
                                </span>
                              ) : status === "expiring_soon" ? (
                                <span className="inline-flex rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                                  Próximo a expirar
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                                  Activo
                                </span>
                              )}
                              {u.mustSetPassword && (
                                <span className="inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                                  Pendiente activar
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-foreground">{formatDate(u.expiresAt)}</td>
                          <td className="py-3 pr-3 text-muted">
                            {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Nunca"}
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card-hover"
                              >
                                Editar
                              </button>
                              {u.role !== "admin" && !u.mustSetPassword && (
                                <button
                                  onClick={() => handleResetPassword(u)}
                                  className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary-softer hover:text-primary"
                                  title="El usuario tendrá que crear una nueva contraseña en su próximo ingreso"
                                >
                                  Resetear contraseña
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDelete(u)}
                                  className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 hover:border-danger/40"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {paginated && (
                <Pagination
                  page={paginated.page}
                  totalPages={paginated.totalPages}
                  total={paginated.total}
                  limit={paginated.limit}
                  onPageChange={setPage}
                  onLimitChange={(n) => {
                    setLimit(n);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </Card>
      </main>

      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onComplete={handleImported}
        />
      )}

      {showCreate && (
        <UserFormModal
          title="Crear nuevo usuario"
          onClose={() => setShowCreate(false)}
          onSubmit={async (values) => {
            const { password: _password, ...rest } = values;
            const payload: CreateUserPayload = { ...rest } as CreateUserPayload;
            await apiClient.post<AuthUser>("/users", payload);
            await handleCreated(payload.email);
          }}
          isCreate
        />
      )}

      {editingUser && (
        <UserFormModal
          title="Editar usuario"
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={async (values) => {
            const { email: _email, password, ...rest } = values;
            const payload: UpdateUserPayload = { ...rest };
            if (password) payload.password = password;
            await apiClient.patch<AuthUser>(`/users/${editingUser.id}`, payload);
            await handleUpdated();
          }}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  tone: "default" | "success" | "danger" | "muted" | "warning";
  active?: boolean;
  onClick?: () => void;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "warning"
          ? "text-warning"
          : tone === "muted"
            ? "text-muted"
            : "text-foreground";

  const ringClass = active ? "ring-2 ring-primary/40 border-primary/40" : "";
  const interactiveClass = onClick
    ? "cursor-pointer hover:border-primary/40 hover:shadow transition-all"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm ${ringClass} ${interactiveClass}`}
    >
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </button>
  );
}

interface UserFormValues extends CreateUserPayload {
  isActive?: boolean;
}

interface UserFormModalProps {
  title: string;
  initial?: AuthUser;
  isCreate?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

function UserFormModal({ title, initial, isCreate, onClose, onSubmit }: UserFormModalProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "student");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(toInputDate(initial?.expiresAt));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const values: UserFormValues = {
        fullName,
        email,
        phone,
        role,
        isActive,
        expiresAt: expiresAt ? toEndOfDayIsoColombia(expiresAt) : null,
      };
      if (!isCreate && password) {
        values.password = password;
      }
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <Field label="Nombre completo">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Correo electrónico">
            <input
              required
              type="email"
              value={email}
              disabled={!isCreate}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </Field>

          <Field label="Número de teléfono (opcional)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          {isCreate ? (
            <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary-softer p-3 text-xs text-primary">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="leading-relaxed">
                <strong className="font-semibold">No necesitas asignar una contraseña.</strong>{" "}
                El usuario creará la suya al iniciar sesión por primera vez con
                su correo electrónico.
              </p>
            </div>
          ) : (
            <Field
              label="Nueva contraseña (opcional)"
              hint="Déjala vacía para no cambiarla. Si la cambias, sustituirá la que tenga el usuario."
            >
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rol">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="student">Estudiante</option>
                <option value="admin">Administrador</option>
              </select>
            </Field>

            <Field label="Fecha de expiración">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
          </div>

          {!isCreate && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Cuenta activa
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
              {isCreate ? "Crear usuario" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
