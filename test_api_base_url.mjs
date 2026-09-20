// Checks how the client picks a backend URL. Run with: node test_api_base_url.mjs
import assert from 'node:assert/strict';
import {
  PRODUCTION_API_URL,
  isPrivateHostname,
  resolveApiBaseUrl,
} from './client/src/api/resolveBaseUrl.js';

const VERCEL = 'flowstate-two-steel.vercel.app';

const cases = [
  {
    name: 'deployed page ignores a leaked localhost API URL',
    actual: resolveApiBaseUrl('http://localhost:8080', VERCEL),
    expected: PRODUCTION_API_URL,
  },
  {
    name: 'deployed page ignores a leaked 127.0.0.1 API URL',
    actual: resolveApiBaseUrl('http://127.0.0.1:8080', VERCEL),
    expected: PRODUCTION_API_URL,
  },
  {
    name: 'local dev keeps the localhost API URL',
    actual: resolveApiBaseUrl('http://localhost:8080', 'localhost'),
    expected: 'http://localhost:8080',
  },
  {
    name: 'LAN dev keeps the localhost API URL',
    actual: resolveApiBaseUrl('http://localhost:8080', '192.168.1.24'),
    expected: 'http://localhost:8080',
  },
  {
    name: 'deployed page honours an explicit production API URL',
    actual: resolveApiBaseUrl('https://flowstate-tvmf.onrender.com', VERCEL),
    expected: 'https://flowstate-tvmf.onrender.com',
  },
  {
    name: 'trailing slash is trimmed',
    actual: resolveApiBaseUrl('https://flowstate-tvmf.onrender.com/', VERCEL),
    expected: 'https://flowstate-tvmf.onrender.com',
  },
  {
    name: 'missing VITE_API_URL falls back to production',
    actual: resolveApiBaseUrl('', VERCEL),
    expected: PRODUCTION_API_URL,
  },
  {
    name: 'undefined VITE_API_URL falls back to production',
    actual: resolveApiBaseUrl(undefined, 'localhost'),
    expected: PRODUCTION_API_URL,
  },
  {
    name: 'relative base is passed through untouched',
    actual: resolveApiBaseUrl('/api', VERCEL),
    expected: '/api',
  },
  {
    name: 'a remote API over http is not rewritten',
    actual: resolveApiBaseUrl('http://staging.example.com:8080', VERCEL),
    expected: 'http://staging.example.com:8080',
  },
];

const hostCases = [
  ['localhost', true],
  ['127.0.0.1', true],
  ['10.0.0.5', true],
  ['172.16.4.9', true],
  ['172.31.255.1', true],
  ['192.168.0.10', true],
  ['macbook.local', true],
  ['172.32.0.1', false],
  ['8.8.8.8', false],
  ['flowstate-two-steel.vercel.app', false],
  ['example.com', false],
];

let failures = 0;

for (const { name, actual, expected } of cases) {
  if (actual === expected) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}\n       expected: ${expected}\n       actual:   ${actual}`);
  }
}

for (const [hostname, expected] of hostCases) {
  const actual = isPrivateHostname(hostname);
  if (actual === expected) {
    console.log(`  ok   isPrivateHostname(${hostname}) === ${expected}`);
  } else {
    failures += 1;
    console.error(`  FAIL isPrivateHostname(${hostname}) expected ${expected}, got ${actual}`);
  }
}

assert.equal(failures, 0, `${failures} API base URL check(s) failed`);
console.log(`\nAll ${cases.length + hostCases.length} API base URL checks passed.`);
