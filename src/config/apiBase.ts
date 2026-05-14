/**
 * Axios base URL for the Express API.
 *
 * - Local dev: usually `/api` (Vite proxies to `VITE_API_PROXY_TARGET` in vite.config.js).
 * - Vercel / static hosting: must be an absolute URL, e.g. `https://your-api.up.railway.app/api`
 *   Set `VITE_API_BASE_URL` in the host’s env at **build** time, then redeploy.
 */

function trimEnv(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const raw = trimEnv(import.meta.env.VITE_API_BASE_URL);

export const apiBase = raw.length > 0 ? raw : "/api";

const isRelativeApiBase = apiBase.startsWith("/") && !apiBase.startsWith("//");

if (typeof window !== "undefined" && import.meta.env.PROD && isRelativeApiBase) {
  // eslint-disable-next-line no-console
  console.error(
    "[api] VITE_API_BASE_URL is missing or relative — requests go to this origin + /api, not your backend.\n" +
      `  Current origin: ${window.location.origin}\n` +
      "  Fix: Vercel → Project → Settings → Environment Variables → add VITE_API_BASE_URL = https://YOUR-API-HOST/api\n" +
      "  (name must start with VITE_; redeploy after saving.)"
  );
}

if (typeof window !== "undefined" && import.meta.env.PROD && apiBase.startsWith("http")) {
  try {
    if (new URL(apiBase).origin === window.location.origin) {
      // eslint-disable-next-line no-console
      console.error(
        "[api] VITE_API_BASE_URL points at this frontend’s origin. Set it to your backend API URL (same value you use in FRONTEND_URL / CORS on the server)."
      );
    }
  } catch {
    /* ignore invalid URL */
  }
}
