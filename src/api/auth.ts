// src/api/authAPI.ts
import { apiClient } from "./apiClient";
import { AuthResponse, LoginPayload, RegisterPayload, AuthTokens, User } from "../types/auth";

export const AuthAPI = {
  login: async (payload: LoginPayload) => {
    const d = await apiClient.post<AuthResponse>('auth/login', payload);
    return d.data;
  },

  socialAuth: async (idToken: string) => {
    const d = await apiClient.post<AuthResponse>('auth/google', {
      idToken
    });
    return d.data;
  },

  register: async (payload: RegisterPayload) => {
    //     {
    //   email: "abc@gmail.com";
    //   password: "123123123";
    //   displayName?: "Max";
    // }
    const d = await apiClient.post<AuthResponse>('auth/register', payload);
    return d.data;
  },

  refresh: async (refreshToken: string) => {
    const d = await apiClient.post<AuthTokens>('auth/refresh', { refreshToken });
    return d.data;
  },

  me: async () => {
    const d = await apiClient.get<User>('auth/me');
    return d.data;
  },

  updateProfile: async (data: { displayName?: string; bioTag?: string }) => {
    const d = await apiClient.patch<User>('users/profile', data);
    return d.data;
  },

  uploadAvatar: async (filePath: string) => {
    const formData = new FormData();
    const filename = filePath.split('/').pop() || 'avatar.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    formData.append('avatar', {
      uri: filePath,
      name: filename,
      type: mimeType,
    } as any);
    const d = await apiClient.patch<User>('users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return d.data;
  },
};