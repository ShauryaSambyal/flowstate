import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { apiUrl } from '../api/client.js';

const LEGACY_STARS_KEY = 'flowstate_stars';
const MAX_MIGRATION = 1000;

async function request(path, options) {
  const response = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

function readLegacyStars() {
  try {
    const raw = localStorage.getItem(LEGACY_STARS_KEY);
    if (raw === null) return null;
    const value = parseInt(raw, 10);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function clearLegacyStars() {
  try {
    localStorage.removeItem(LEGACY_STARS_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function useStars() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authResolved) return undefined;

    if (!user?.email) {
      setStars(0);
      setLoading(false);
      return undefined;
    }

    const email = user.email;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await request(`/api/v1/users/stars?email=${encodeURIComponent(email)}`, {
          method: 'GET',
        });
        let total = data.stars || 0;

        const legacy = readLegacyStars();
        if (legacy !== null && legacy > total) {
          let delta = legacy - total;
          if (delta > MAX_MIGRATION) delta = MAX_MIGRATION;
          try {
            const migrated = await request('/api/v1/users/stars/claim', {
              method: 'POST',
              body: JSON.stringify({ email, amount: delta, reason: 'local-migration' }),
            });
            total = typeof migrated.stars === 'number' ? migrated.stars : total + delta;
            clearLegacyStars();
          } catch {
            /* Keep the local value so the one-time migration can retry later. */
            if (!cancelled) setStars(total);
            return;
          }
        } else if (legacy !== null) {
          clearLegacyStars();
        }

        if (!cancelled) setStars(total);
      } catch {
        if (!cancelled) setStars(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authResolved]);

  const addStars = useCallback(
    async (amount, reason, photoHash) => {
      if (!user?.email) {
        throw new Error('Sign in to collect stars');
      }
      const data = await request('/api/v1/users/stars/claim', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, amount, reason, photoHash }),
      });
      setStars(typeof data.stars === 'number' ? data.stars : 0);
      return data;
    },
    [user]
  );

  const isGuest = authResolved && !user;

  return { stars, addStars, loading, isGuest };
}