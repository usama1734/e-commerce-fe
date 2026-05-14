/**
 * Resolve public API base for axios (used at build time in vite.config.js only).
 * Supports Vercel env names people often use by mistake (without VITE_ prefix).
 */

function normalizePublicApiBase(input) {
  const t = String(input || "").trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  if (!/^https?:\/\//i.test(t)) return t;
  try {
    const u = new URL(t);
    const path = (u.pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/" || path === "") {
      return `${u.origin}/api`;
    }
    return t.replace(/\/+$/, "");
  } catch {
    return t.replace(/\/+$/, "");
  }
}

/**
 * @param {Record<string, string>} env from loadEnv
 */
function resolvePublicApiBase(env) {
  const chain = [
    process.env.VITE_API_BASE_URL,
    process.env.VITE_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.BACKEND_PUBLIC_URL,
    env.VITE_API_BASE_URL,
    env.VITE_BACKEND_URL,
  ];
  for (const c of chain) {
    if (typeof c === "string" && c.trim()) {
      return normalizePublicApiBase(c);
    }
  }
  return "";
}

module.exports = { resolvePublicApiBase };
