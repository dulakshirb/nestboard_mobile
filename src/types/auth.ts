// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "USER";
  avatarUrl: string | null;
  bioTag: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = AuthTokens;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}