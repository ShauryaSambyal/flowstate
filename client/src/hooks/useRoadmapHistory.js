import { useCallback, useEffect, useState } from 'react';
import {
  GUEST_SCOPE,
  clearRoadmaps,
  listRoadmaps,
  recordRoadmap,
  removeRoadmap,
  scopeFor,
  subscribe,
} from '../history/roadmapHistory.js';

/**
 * The signed-in user's roadmap history (or this browser's, when signed out).
 * Returns the list plus the writer the roadmap pages call after a generation.
 */
export function useRoadmapHistory() {
  const [email, setEmail] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
        const [firebaseModule, authModule] = await Promise.all([
          import('../../firebase.js'),
          import('firebase/auth'),
        ]);
        if (cancelled) return;
        unsubscribe = authModule.onAuthStateChanged(firebaseModule.auth, (user) => {
          if (cancelled) return;
          setEmail(user?.email || null);
          setAuthResolved(true);
        });
      } catch {
        if (!cancelled) setAuthResolved(true);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const scope = scopeFor(email);

  useEffect(() => {
    if (!authResolved) return undefined;
    setRoadmaps(listRoadmaps(scope));
    return subscribe(() => setRoadmaps(listRoadmaps(scope)));
  }, [scope, authResolved]);

  const record = useCallback(
    (entry) => {
      recordRoadmap(scope, entry);
      setRoadmaps(listRoadmaps(scope));
    },
    [scope]
  );

  const remove = useCallback(
    (id) => {
      removeRoadmap(scope, id);
      setRoadmaps(listRoadmaps(scope));
    },
    [scope]
  );

  const clear = useCallback(() => {
    clearRoadmaps(scope);
    setRoadmaps(listRoadmaps(scope));
  }, [scope]);

  return {
    roadmaps,
    record,
    remove,
    clear,
    email,
    scope,
    isGuest: scope === GUEST_SCOPE,
    loading: !authResolved,
  };
}
