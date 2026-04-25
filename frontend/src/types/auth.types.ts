export type UserRole = "admin" | "student";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  expiresAt: string | null;
  lastLoginAt: string | null;
  mustSetPassword: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CreateUserPayload {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
  expiresAt?: string | null;
}

export interface UpdateUserPayload {
  fullName?: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  expiresAt?: string | null;
}

export type UserStatusFilter = "all" | "active" | "expired" | "disabled" | "expiring_soon";

export interface PaginatedUsers {
  data: AuthUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersStats {
  total: number;
  active: number;
  expired: number;
  disabled: number;
  expiringSoon: number;
}
