// frontend/lib/api.ts
const DEFAULT_LOCAL_API = "http://127.0.0.1:8000";

// Render / prod: NEXT_PUBLIC_API_URL = https://pab-kviz-backend-rdb8.onrender.com
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_LOCAL_API).replace(/\/$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}