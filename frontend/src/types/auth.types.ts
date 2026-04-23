export type UserRole = "admin" | "student";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  expiresAt: string | null;
  lastLoginAt: string | null;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  expiresAt?: string | null;
}

export interface UpdateUserPayload {
  fullName?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  expiresAt?: string | null;
}
