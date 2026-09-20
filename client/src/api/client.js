import axios from 'axios';
import { PRODUCTION_API_URL, resolveApiBaseUrl } from './resolveBaseUrl.js';

// Single source of truth for the backend URL used by every API call.
//
// Resolution order:
//   1. VITE_API_URL, baked in at build time.
//   2. The production backend on Render.
//
// A build-time VITE_API_URL of http://localhost:8080 is IGNORED whenever the page
// is not itself running on a local/private address. That value is correct for
// local dev, but if it ever ends up in a deployed bundle the browser tries to
// reach the visitor's own machine, and the HTTPS page blocks the plain-HTTP call
// as mixed content — which surfaces in the UI as a bare "Network Error".
const CONFIGURED_API_URL = import.meta.env.VITE_API_URL;
const PAGE_HOSTNAME =
  typeof window !== 'undefined' ? window.location.hostname : '';

export const API_BASE_URL = resolveApiBaseUrl(CONFIGURED_API_URL, PAGE_HOSTNAME);

if (
  CONFIGURED_API_URL &&
  API_BASE_URL !== String(CONFIGURED_API_URL).trim().replace(/\/+$/, '')
) {
  console.warn(
    `[flowstate] VITE_API_URL="${CONFIGURED_API_URL}" only works on a local machine, ` +
      `but this page is served from "${PAGE_HOSTNAME}" — using ${PRODUCTION_API_URL} instead. ` +
      'Set VITE_API_URL to your deployed backend in the host\'s environment settings.'
  );
}

export function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Render's free instance sleeps when idle; the first request has to wait out a
// ~60s cold start, so allow a generous timeout instead of the axios default of
// "wait forever".
const COLD_START_TIMEOUT_MS = 75000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: COLD_START_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// A sleeping instance sometimes drops the very first connection instead of
// queueing it, so retry once before reporting a network failure.
api.interceptors.response.use(undefined, (error) => {
  const config = error?.config;
  const looksLikeColdStart =
    !error?.response &&
    ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'].includes(error?.code);

  if (looksLikeColdStart && config && !config.__coldStartRetried) {
    config.__coldStartRetried = true;
    return api.request(config);
  }

  return Promise.reject(error);
});

/** Fire-and-forget ping so a sleeping backend wakes while the visitor reads the page. */
export function warmUpApi() {
  if (typeof window === 'undefined') return;
  fetch(apiUrl('/health'), { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(() => {
    /* Warming up is best-effort — never surface a failure to the user. */
  });
}

/** Turn an axios error into a message worth showing a user. */
export function formatApiError(error) {
  if (error?.response) {
    return (
      error.response.data?.error ||
      error.response.data?.message ||
      `Request failed (${error.response.status})`
    );
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'The AI service took too long to respond. Please try again.';
  }

  if (error?.code === 'ERR_NETWORK') {
    return `Could not reach the AI service (${API_BASE_URL}). It may still be waking up — please try again in a moment.`;
  }

  return error?.message || 'Connection failed';
}
