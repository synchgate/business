import axios from "axios";
import { session } from "@/lib/session";

// VITE_API_BASE_URL should point at the gateway, e.g.
// https://api.synchgate.com/v1 in production or http://localhost:8000/v1
// locally. Every endpoint module below appends its own resource path onto
// this (e.g. `invoicing/invoices/`).
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-App-Source": "ebs",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = session.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Set by AuthProvider on mount so a 401 anywhere can force a clean sign-out
// without this module importing the auth context (which would create a
// circular import between context <-> client).
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      session.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
