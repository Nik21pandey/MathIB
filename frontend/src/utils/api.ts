// Base URL for API - exported for use across frontend API modules.
// Configure VITE_API_URL in .env (e.g. VITE_API_URL=http://localhost:8000/api/v1 for local dev).
const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const cleanedUrl = rawEnvUrl ? rawEnvUrl.replace(/[\[\]\(\)"']/g, '').replace(/\/+$/, '') : '';

export const BASE_URL_GLOBAL: string = cleanedUrl || 'https://mathib-backend.onrender.com/api/v1';

export default BASE_URL_GLOBAL;
