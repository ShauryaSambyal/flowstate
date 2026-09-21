/* ============================================================
   FLOWSTATE — ROADMAP HISTORY
   Every roadmap a signed-in user generates is kept, newest first, so the
   History page (and the bento card on the landing page) can show the trail of
   intentions they have actually worked through.

   Storage is per account: `flowstate.roadmap.history.<email>` for signed-in
   users, `...guest` otherwise. The legacy single-entry key
   (`flowstate_life_outcomes`) is no longer written — it only ever held the last
   roadmap, which is exactly the limitation this replaces.
   ============================================================ */

const KEY_PREFIX = 'flowstate.roadmap.history.';
export const GUEST_SCOPE = 'guest';
const MAX_ENTRIES = 60;
const EVENT = 'flowstate:roadmap-history';

function storage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function scopeFor(email) {
  return email ? String(email).toLowerCase() : GUEST_SCOPE;
}

function keyFor(scope) {
  return `${KEY_PREFIX}${scope || GUEST_SCOPE}`;
}

function read(scope) {
  const store = storage();
  if (!store) return [];
  try {
    const parsed = JSON.parse(store.getItem(keyFor(scope)) || '[]');
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && entry.goal) : [];
  } catch {
    return [];
  }
}

function write(scope, entries) {
  const store = storage();
  if (store) {
    try {
      store.setItem(keyFor(scope), JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {
      /* Quota or private mode — the session still works in memory. */
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT));
  }
}

/** Newest first. */
export function listRoadmaps(scope) {
  return [...read(scope)].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export function countRoadmaps(scope) {
  return read(scope).length;
}

/**
 * Record a generated roadmap. The same goal is never stored twice: re-running a
 * goal bumps its run count and moves it back to the top, so the history reads as
 * a list of intentions rather than a log of clicks.
 */
export function recordRoadmap(scope, entry) {
  const goal = String(entry?.goal || '').trim();
  if (!goal) return null;

  const normalised = goal.toLowerCase().replace(/\s+/g, ' ');
  const existing = read(scope);
  const match = existing.find(
    (item) => String(item.goal || '').toLowerCase().replace(/\s+/g, ' ') === normalised
  );

  const record = {
    id: match?.id || `rm-${Date.now().toString(36)}`,
    goal,
    roadmap: Array.isArray(entry.roadmap) ? entry.roadmap.slice(0, 12) : match?.roadmap || [],
    impact: entry.impact || match?.impact || null,
    runs: (match?.runs || 0) + 1,
    createdAt: new Date().toISOString(),
    firstSeenAt: match?.firstSeenAt || new Date().toISOString(),
  };

  write(scope, [record, ...existing.filter((item) => item.id !== record.id)]);
  return record;
}

export function removeRoadmap(scope, id) {
  write(scope, read(scope).filter((item) => item.id !== id));
}

export function clearRoadmaps(scope) {
  write(scope, []);
}

/** "12 Apr 2026" — used by the history card and the History page. */
export function formatRoadmapDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Notifies on local writes and on changes made in another tab. */
export function subscribe(listener) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
