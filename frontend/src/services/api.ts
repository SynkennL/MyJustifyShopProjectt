import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "vue3-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Oturum süreniz doldu, lütfen tekrar giriş yapın!");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      toast.error("Bu işlem için yetkiniz bulunmuyor!");
    }

    if (error.response?.status === 404) {
      toast.error("İstenen kaynak bulunamadı!");
    }

    if (error.response?.status >= 500) {
      toast.error("Sunucu hatası! Lütfen daha sonra tekrar deneyin.");
    }

    return Promise.reject(error);
  }
);

// GET Request
export async function apiGet<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.get<T>(path, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// POST Request
export async function apiPost<T = any>(
  path: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, data, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// PUT Request
export async function apiPut<T = any>(
  path: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.put<T>(path, data, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// PATCH Request
export async function apiPatch<T = any>(
  path: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.patch<T>(path, data, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// DELETE Request
export async function apiDelete<T = any>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.delete<T>(path, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export { apiClient };

export default apiClient;