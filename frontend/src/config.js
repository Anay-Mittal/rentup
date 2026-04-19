// Single source of truth for API base URL.
// Set REACT_APP_API_URL in .env.production (or Netlify env vars) to your deployed backend.
// Falls back to local dev backend.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';
