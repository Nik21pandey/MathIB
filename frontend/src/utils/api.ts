// Base URL for API - exported for use in other API files.
// Set VITE_API_URL in a .env file to point the frontend at a deployed backend.
export const BASE_URL_GLOBAL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// This file will contain other API endpoints (questions, papers, etc.)
// For authentication endpoints, see authApi.ts
