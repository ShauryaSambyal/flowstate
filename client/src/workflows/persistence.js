/* ============================================================
   FLOWSTATE — WORKFLOW PERSISTENCE
   Local-first, with optional sync for signed-in users.

     guest            -> localStorage only
     signed in        -> localStorage + FlowState backend (users.workflows)

   Nothing here is required for the workflow experience to work: if the
   backend is asleep or the user is signed out, everything still runs from
   localStorage. Remote calls are best-effort and never throw at the caller.
   ============================================================ */

import { api } from '../api/client.js';

const STORE_VERSION = 1;
const SCOPE_PREFIX = 'flowstate.workflow.store.';
export const GUEST_SCOPE = 'guest';

function storage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function emptyStore() {
  return { version: STORE_VERSION, runs: {}, drafts: {} };
}

function sanitizeStore(value) {
  if (!value || typeof value !== 'object') return emptyStore();
  return {
    version: STORE_VERSION,
    runs: value.runs && typeof value.runs === 'object' ? value.runs : {},
    drafts: value.drafts && typeof value.drafts === 'object' ? value.drafts : {},
  };
}

/* ------------------------------------------------------------
   localStorage
   ------------------------------------------------------------ */

export function readLocalStore(scope = GUEST_SCOPE) {
  const store = storage();
  if (!store) return emptyStore();
  try {
    const raw = store.getItem(`${SCOPE_PREFIX}${scope}`);
    return raw ? sanitizeStore(JSON.parse(raw)) : emptyStore();
  } catch {
    return emptyStore();
  }
}

export function writeLocalStore(scope = GUEST_SCOPE, value) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(`${SCOPE_PREFIX}${scope}`, JSON.stringify(sanitizeStore(value)));
  } catch {
    /* Quota or private mode — the session still works in memory. */
  }
}

export function listRuns(scope = GUEST_SCOPE) {
  return sortRuns(Object.values(readLocalStore(scope).runs));
}

export function upsertRun(scope, run) {
  const store = readLocalStore(scope);
  store.runs[run.id] = run;
  writeLocalStore(scope, store);
  return run;
}

export function removeRun(scope, id) {
  const store = readLocalStore(scope);
  delete store.runs[id];
  writeLocalStore(scope, store);
}

/** Regenerating a workflow leaves the previous draft behind — drop it. */
export function pruneDraftRuns(scope, workflowId, keepId) {
  const store = readLocalStore(scope);
  let changed = false;
  for (const [id, run] of Object.entries(store.runs)) {
    if (id !== keepId && run.workflowId === workflowId && run.status === 'draft') {
      delete store.runs[id];
      changed = true;
    }
  }
  if (changed) writeLocalStore(scope, store);
  return store.runs;
}

export function readDraft(scope, workflowId) {
  return readLocalStore(scope).drafts[workflowId] || null;
}

export function writeDraft(scope, workflowId, draft) {
  const store = readLocalStore(scope);
  store.drafts[workflowId] = { ...draft, updatedAt: new Date().toISOString() };
  writeLocalStore(scope, store);
}

export function clearDraft(scope, workflowId) {
  const store = readLocalStore(scope);
  delete store.drafts[workflowId];
  writeLocalStore(scope, store);
}

export function sortRuns(runs) {
  return [...runs].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

/* ------------------------------------------------------------
   Backend sync (signed-in users only)
   ------------------------------------------------------------ */

export async function fetchRemoteRuns(email) {
  if (!email) return [];
  try {
    const response = await api.get('/api/v1/users/workflows', {
      params: { email },
      timeout: 15000,
    });
    if (!response.data?.success || !Array.isArray(response.data.workflows)) return [];
    return sortRuns(response.data.workflows);
  } catch {
    return [];
  }
}

export async function pushRemoteRun(email, run) {
  if (!email) return null;
  try {
    const response = await api.put(
      '/api/v1/users/workflows',
      { email, workflow: run },
      { timeout: 15000 }
    );
    return response.data?.workflow || null;
  } catch {
    return null;
  }
}

export async function deleteRemoteRun(email, id) {
  if (!email) return false;
  try {
    await api.delete(`/api/v1/users/workflows/${encodeURIComponent(id)}`, {
      params: { email },
      timeout: 15000,
    });
    return true;
  } catch {
    return false;
  }
}

/** Newest-updated record wins, so a resumed device does not lose local progress. */
export function mergeRuns(localRuns = [], remoteRuns = []) {
  const byId = new Map();
  for (const run of [...localRuns, ...remoteRuns]) {
    if (!run?.id) continue;
    const existing = byId.get(run.id);
    if (!existing || String(run.updatedAt || '') > String(existing.updatedAt || '')) {
      byId.set(run.id, run);
    }
  }
  return sortRuns(Array.from(byId.values()));
}
