"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserRole,
} from "@/types/auth.types";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin límite";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
}

function toInputDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function AdminContent() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<AuthUser[]>("/users");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const notify = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const handleCreated = useCallback(
    (user: AuthUser) => {
      setUsers((prev) => [user, ...prev]);
      setShowCreate(false);
      notify("Usuario creado correctamente");
    },
    [notify],
  );

  const handleUpdated = useCallback(
    (user: AuthUser) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      setEditingUser(null);
      notify("Usuario actualizado correctamente");
    },
    [notify],
  );

  const handleDelete = useCallback(
    async (user: AuthUser) => {
      if (!confirm(`¿Eliminar al usuario ${user.email}?`)) return;
      try {
        await apiClient.delete(`/users/${user.id}`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        notify("Usuario eliminado");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error eliminando usuario");
      }
    },
    [notify],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const total = users.length;
    const active = users.filter(
      (u) => u.isActive && (!u.expiresAt || new Date(u.expiresAt) > now),
    ).length;
    const expired = users.filter(
      (u) => u.expiresAt && new Date(u.expiresAt) <= now,
    ).length;
    return { total, active, expired };
  }, [users]);

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
          <Button onClick={() => setShowCreate(true)}>+ Nuevo usuario</Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total usuarios" value={stats.total} tone="default" />
          <StatCard label="Activos" value={stats.active} tone="success" />
          <StatCard label="Expirados" value={stats.expired} tone="danger" />
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

        <Card className="mt-6" title="Usuarios" description="Listado de cuentas registradas">
          {isLoading ? (
            <p className="text-sm text-muted">Cargando...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted">No hay usuarios aún.</p>
          ) : (
            <div className="overflow-x-auto">
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
                    const expired = u.expiresAt && new Date(u.expiresAt) <= new Date();
                    return (
                      <tr key={u.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-3">
                          <div className="font-medium text-foreground">{u.fullName}</div>
                          <div className="text-xs text-muted">{u.email}</div>
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
                          {!u.isActive ? (
                            <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                              Desactivado
                            </span>
                          ) : expired ? (
                            <span className="inline-flex rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                              Expirado
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-foreground">{formatDate(u.expiresAt)}</td>
                        <td className="py-3 pr-3 text-muted">
                          {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Nunca"}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card-hover"
                            >
                              Editar
                            </button>
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
          )}
        </Card>
      </main>

      {showCreate && (
        <UserFormModal
          title="Crear nuevo usuario"
          onClose={() => setShowCreate(false)}
          onSubmit={async (values) => {
            const user = await apiClient.post<AuthUser>("/users", values);
            handleCreated(user);
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
            const user = await apiClient.patch<AuthUser>(`/users/${editingUser.id}`, payload);
            handleUpdated(user);
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
}: {
  label: string;
  value: number;
  tone: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
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
        password,
        role,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };
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

          <Field
            label={isCreate ? "Contraseña" : "Nueva contraseña (opcional)"}
            hint={isCreate ? "Mínimo 6 caracteres" : "Déjala vacía para no cambiarla"}
          >
            <input
              type="password"
              required={isCreate}
              minLength={isCreate ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>

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
