/// <reference types="vite/client" />

/** Injected by Vite `define` in vite.config.js */
declare const __APP_API_BASE__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
