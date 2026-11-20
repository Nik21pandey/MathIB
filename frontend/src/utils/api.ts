// Base URL for API - exported for use across frontend API modules.
// Configure VITE_API_URL in .env (e.g. VITE_API_URL=http://localhost:8000/api/v1 for local dev).
const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
let cleanedUrl = rawEnvUrl ? rawEnvUrl.replace(/[\[\]\(\)"']/g, '').replace(/\/+$/, '') : '';

// Auto-heal duplicate URL prefixes if pasted multiple times in dashboard env vars
if (cleanedUrl.includes('https://') && cleanedUrl.lastIndexOf('https://') > 0) {
  cleanedUrl = cleanedUrl.substring(cleanedUrl.lastIndexOf('https://'));
} else if (cleanedUrl.includes('http://') && cleanedUrl.lastIndexOf('http://') > 0) {
  cleanedUrl = cleanedUrl.substring(cleanedUrl.lastIndexOf('http://'));
}
if (cleanedUrl.includes('/api/v1/api/v1')) {
  cleanedUrl = cleanedUrl.replace('/api/v1/api/v1', '/api/v1');
}

export const BASE_URL_GLOBAL: string = cleanedUrl || 'https://mathib-backend.onrender.com/api/v1';

export default BASE_URL_GLOBAL;
