// Pure, dependency-free base-URL resolution so it can be reasoned about (and
// tested) without a browser or a Vite build.

/** Backend used whenever no usable VITE_API_URL is configured. */
export const PRODUCTION_API_URL = 'https://flowstate-tvmf.onrender.com';

const LOOPBACK_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  'localhost.localdomain',
]);

export function isLoopbackHostname(hostname) {
  const host = String(hostname || '').toLowerCase();
  return LOOPBACK_HOSTNAMES.has(host) || host.endsWith('.localhost');
}

/**
 * True for hostnames that only resolve on the visitor's machine or their own
 * network (loopback, RFC1918 ranges, *.local / *.internal).
 */
export function isPrivateHostname(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (isLoopbackHostname(host)) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host.endsWith('.localhost')) return true;

  const octets = host.split('.');
  if (octets.length !== 4) return false;
  const parts = octets.map((octet) => (/^\d{1,3}$/.test(octet) ? Number(octet) : NaN));
  if (parts.some((part) => Number.isNaN(part) || part > 255)) return false;

  const [a, b] = parts;
  return (
    a === 127 || // loopback
    a === 10 || // 10.0.0.0/8
    (a === 192 && b === 168) || // 192.168.0.0/16
    (a === 172 && b >= 16 && b <= 31) // 172.16.0.0/12
  );
}

/**
 * Decide which backend the client should talk to.
 *
 * A configured URL pointing at loopback is only honoured while the page itself
 * is served from a private/local address. Otherwise it is a development value
 * that leaked into a deployed build — the browser would try to reach the
 * visitor's own machine over plain HTTP from an HTTPS origin, which fails as a
 * mixed-content block and reaches the UI as a bare "Network Error".
 *
 * @param {string} configuredUrl value of VITE_API_URL at build time
 * @param {string} pageHostname  hostname the app is currently served from
 * @returns {string} base URL with any trailing slashes removed
 */
export function resolveApiBaseUrl(configuredUrl, pageHostname = '') {
  const configured = String(configuredUrl || '').trim().replace(/\/+$/, '');
  if (!configured) return PRODUCTION_API_URL;

  if (!isPrivateHostname(pageHostname)) {
    try {
      if (isLoopbackHostname(new URL(configured).hostname)) return PRODUCTION_API_URL;
    } catch {
      /* Not an absolute URL (e.g. "/api") — honour it as a relative base. */
    }
  }

  return configured;
}
