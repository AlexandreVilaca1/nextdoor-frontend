const DEFAULT_API_URL = "http://localhost:3000";

/**
 * Base URL of the backend API.
 *
 * Comes from VITE_API_URL (.env) and falls back to the local backend, so a
 * fresh clone runs with `npm run dev` without any setup.
 */
export const API_URL: string = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
