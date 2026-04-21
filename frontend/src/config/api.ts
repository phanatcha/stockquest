/**
 * Base URL for the Nest API.
 * - Dev default: `/api` (see `vite.config.ts` proxy) — same-origin, avoids CORS when the app is opened as 127.0.0.1 vs localhost.
 * - Optional: set `VITE_API_URL` in `.env` to call the API directly (ensure `main.ts` CORS includes your browser origin).
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw?.trim()) {
    return raw.trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'http://localhost:3000';
}
