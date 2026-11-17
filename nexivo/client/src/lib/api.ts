/**
 * Typed fetch wrapper for the Nexivo API.
 * - Always sends cookies (credentials: "include").
 * - Unwraps { success, data, message } and throws ApiError on failure.
 * - Calls relative /api so the Vite proxy (dev) and the Vercel rewrite (prod) keep everything same-origin.
 */
const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  errors?: FieldErrors;
  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface Envelope<T> { success: boolean; data?: T; message?: string; errors?: FieldErrors }

type Query = Record<string, string | number | boolean | null | undefined>;

export function withQuery(path: string, query?: Query) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function parse<T>(res: Response): Promise<{ data: T; message?: string }> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = (isJson ? await res.json().catch(() => null) : null) as Envelope<T> | null;
  if (!res.ok || !body || body.success === false) {
    const fallback = res.status === 0 || res.status >= 500 ? "The server is not responding. Please try again in a moment." : `Request failed (${res.status})`;
    throw new ApiError(res.status, body?.message ?? fallback, body?.errors);
  }
  return { data: body.data as T, message: body.message };
}

export async function request<T>(method: string, path: string, body?: unknown, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      credentials: "include",
      headers: body instanceof FormData ? undefined : body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }
  return parse<T>(res);
}

export const api = {
  get: async <T>(path: string, query?: Query, init?: RequestInit) => (await request<T>("GET", withQuery(path, query), undefined, init)).data,
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
};

/** Multipart upload with progress (fetch has no upload progress, so this uses XHR). */
export function upload<T>(path: string, form: FormData, onProgress?: (percent: number) => void) {
  return new Promise<{ data: T; message?: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/api${path}`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new ApiError(0, "Network error. Check your connection and try again."));
    xhr.onload = () => {
      let body: Envelope<T> | null = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && body?.success) resolve({ data: body.data as T, message: body.message });
      else reject(new ApiError(xhr.status, body?.message ?? (xhr.status === 413 ? "File is too large" : `Upload failed (${xhr.status})`), body?.errors));
    };
    xhr.send(form);
  });
}

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");
