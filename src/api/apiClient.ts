import axios from "axios";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { store } from "../store/store";
import { logout, saveToken } from "../store/authSlice";
import { persistLogin, removeRefreshToken } from "../util/localStorage";
import { Platform } from "react-native";
import {
  API_URL_ANDROID,
  API_URL_IOS,
} from "@env";

const storage = createAsyncStorage("appDB");

const API_URL =
  Platform.OS === "android" ? API_URL_ANDROID : API_URL_IOS;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor — attach the access token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Token refresh mutex — only one refresh at a time
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  failedQueue = [];
}

// Response interceptor — refresh on 401, then retry once
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const { refreshToken } = store.getState().auth;
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error);
        store.dispatch(logout());
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}auth/refresh`,
          { refreshToken }
        );
        store.dispatch(saveToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }));
        persistLogin(data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        store.dispatch(logout());
        await removeRefreshToken();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
