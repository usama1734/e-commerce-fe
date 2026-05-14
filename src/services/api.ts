import axios from "axios";

/** Must match `AUTH_STORAGE_KEY` in `App.tsx`. */
const AUTH_STORAGE_KEY = "auth_state";

/** Dispatched when access JWT is invalid and refresh failed or was not possible → clear session. */
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

/** Dispatched after a successful silent refresh so React state picks up new tokens. */
export const AUTH_TOKENS_REFRESHED_EVENT = "auth:tokens-refreshed";

function readStoredAuth(): { user?: unknown; accessToken?: string; refreshToken?: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user?: unknown; accessToken?: string; refreshToken?: string };
  } catch {
    return null;
  }
}

/**
 * Uses fetch (not `api`) to avoid interceptor recursion.
 * @returns true if new tokens were written to localStorage
 */
async function trySilentRefresh(): Promise<boolean> {
  const stored = readStoredAuth();
  const refreshToken = stored?.refreshToken;
  if (!refreshToken || typeof refreshToken !== "string") return false;

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
  if (!data?.accessToken || !data?.refreshToken) return false;

  const next = {
    user: stored?.user ?? null,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  document.dispatchEvent(
    new CustomEvent(AUTH_TOKENS_REFRESHED_EVENT, {
      detail: { accessToken: data.accessToken, refreshToken: data.refreshToken },
    })
  );
  return true;
}

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const url = String(error?.config?.url ?? "");

    if (
      status === 401 &&
      typeof message === "string" &&
      message.includes("Invalid or expired access token") &&
      typeof document !== "undefined" &&
      !url.includes("/auth/refresh")
    ) {
      try {
        const renewed = await trySilentRefresh();
        if (!renewed) {
          document.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
        }
      } catch {
        document.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);
