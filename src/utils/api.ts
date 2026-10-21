const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
const API_URL = `${BASE_URL}/api/v1`;

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  noRefresh?: boolean; 
};

// While one refresh is running, every other request waits for the same one.
// The backend rotates refresh tokens, so two parallel refreshes would make the second fail.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/shopkeepers/refresh-token`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { method = "GET", body, noRefresh = false } = options;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include", // sends the login cookies
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError("Unable to connect to the server. Please try again.", 0);
  }

  const json = await res.json().catch(() => null);

  // Access token expired: refresh once, then repeat the same request once
  if (res.status === 401 && !noRefresh && !isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!res.ok || json?.success === false) {
    throw new ApiRequestError(
      json?.message ?? `Request failed (${res.status})`,
      res.status
    );
  }

  // Every backend response looks like { statusCode, message, data, success }
  return json?.data as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};