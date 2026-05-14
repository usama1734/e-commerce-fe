/**
 * Axios base URL for the Express API.
 *
 * Value is set at **build time** in `vite.config.js` (`__APP_API_BASE__`) from, in order:
 * `VITE_API_BASE_URL`, `VITE_BACKEND_URL`, `BACKEND_URL`, `BACKEND_PUBLIC_URL`, then `.env` files.
 *
 * - Local dev: usually `/api` (Vite proxies to `VITE_API_PROXY_TARGET`).
 * - Vercel: set one of the vars above to your backend (https://…). Redeploy after changing env.
 */

function trimEnv(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const raw = trimEnv(__APP_API_BASE__);

export const apiBase = raw.length > 0 ? raw : "/api";

const isRelativeApiBase = apiBase.startsWith("/") && !apiBase.startsWith("//");

if (typeof window !== "undefined" && import.meta.env.PROD && isRelativeApiBase) {
  // eslint-disable-next-line no-console
  console.error(
    "[api] No absolute backend URL at build time — requests use /api on this host.\n" +
      `  Origin: ${window.location.origin}\n` +
      "  Vercel → Settings → Environment Variables → add one of:\n" +
      "    VITE_API_BASE_URL = https://YOUR-API-HOST/api\n" +
      "    or BACKEND_URL / VITE_BACKEND_URL / BACKEND_PUBLIC_URL = https://YOUR-API-HOST (path /api added if missing)\n" +
      "  Then redeploy (env is baked in at build)."
  );
}

if (typeof window !== "undefined" && import.meta.env.PROD && apiBase.startsWith("http")) {
  try {
    if (new URL(apiBase).origin === window.location.origin) {
      // eslint-disable-next-line no-console
      console.error(
        "[api] API base URL is this frontend’s origin. Point it at your API server (and allow CORS from this origin on the backend)."
      );
    }
  } catch {
    /* ignore invalid URL */
  }
}
