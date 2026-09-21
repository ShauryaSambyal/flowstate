import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase.js';
import { useRoadmapHistory } from '../hooks/useRoadmapHistory.js';
import { formatRoadmapDate } from '../history/roadmapHistory.js';
import { GUEST_SCOPE, listRuns } from '../workflows/persistence.js';
import { taskStats } from '../workflows/engine.js';
import WorkflowModal from '../components/workflow/WorkflowModal.jsx';
import './SmartGuidance.css';
import './HistoryPage.css';

/* Everything this account has worked through: every roadmap it generated and
   every workflow run it is tracking, in one place. */
const HistoryPage = () => {
  const { roadmaps, remove, clear, email, isGuest, loading } = useRoadmapHistory();

  const [uid, setUid] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [runs, setRuns] = useState([]);
  const [openRoadmapId, setOpenRoadmapId] = useState(null);
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

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
          setUid(user?.uid || null);
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

  const refreshRuns = useCallback(() => {
    setRuns(listRuns(uid || GUEST_SCOPE));
  }, [uid]);

  useEffect(() => {
    if (!authResolved) return;
    refreshRuns();
  }, [authResolved, refreshRuns]);

  const openRuns = useMemo(() => runs.filter((run) => run.status !== 'draft'), [runs]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      /* Sign-in cancelled or failed. */
    }
  };

  return (
    <div className="smart-guidance-page history-page">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Flow
      </Link>

      <div className="content-container">
        <motion.div
          className="header-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="page-tag">History</span>
          <h1 className="page-title">Your trail of intent</h1>
          <p className="page-subtitle">
            Every roadmap you have generated and every workflow you are tracking, kept in order.
          </p>
        </motion.div>

        {!isGuest && email && <p className="history-account">Signed in as {email}</p>}

        {isGuest && (
          <div className="history-notice">
            <p>
              You are signed out, so this history lives on this device only. Sign in to keep it with
              your account.
            </p>
            <button type="button" className="btn-primary" onClick={handleSignIn}>
              Sign in with Google
            </button>
          </div>
        )}

        <section className="history-section" aria-label="Roadmap history">
          <div className="history-section-head">
            <h2 className="history-heading">Roadmaps</h2>
            <span className="history-count">
              {loading ? '…' : `${roadmaps.length} total`}
              {roadmaps.length > 0 && (
                <button type="button" className="history-clear" onClick={clear}>
                  Clear
                </button>
              )}
            </span>
          </div>

          {!loading && roadmaps.length === 0 && (
            <div className="history-empty">
              <p>No roadmaps yet. Describe a goal on Smart Guidance and it will appear here.</p>
              <Link to="/smart-guidance" className="btn-primary">
                Chart a path
              </Link>
            </div>
          )}

          <ul className="history-list">
            {roadmaps.map((item) => {
              const open = openRoadmapId === item.id;
              return (
                <li key={item.id} className={`history-item${open ? ' is-open' : ''}`}>
                  <div className="history-item-head">
                    <button
                      type="button"
                      className="history-item-toggle"
                      aria-expanded={open}
                      onClick={() => setOpenRoadmapId(open ? null : item.id)}
                    >
                      <span className="history-goal">{item.goal}</span>
                      <span className="history-meta">
                        {formatRoadmapDate(item.createdAt)}
                        {item.runs > 1 ? ` · ${item.runs} runs` : ''}
                        {item.roadmap?.length ? ` · ${item.roadmap.length} phases` : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="history-remove"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.goal} from history`}
                    >
                      ✕
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        className="history-item-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                      >
                        <ol className="history-phases">
                          {(item.roadmap || []).map((phase, index) => (
                            <li key={`${item.id}-${index}`} className="history-phase">
                              <span className="history-phase-name">{phase.phase}</span>
                              <span className="history-phase-detail">{phase.details}</span>
                            </li>
                          ))}
                        </ol>

                        {item.impact && (
                          <div className="history-impact">
                            {[
                              ['1 month', item.impact.oneMonth],
                              ['3 months', item.impact.threeMonths],
                              ['6 months', item.impact.sixMonths],
                            ]
                              .filter(([, text]) => text)
                              .map(([label, text]) => (
                                <div key={label} className="history-impact-item">
                                  <span className="history-impact-time">{label}</span>
                                  <p>{text}</p>
                                </div>
                              ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="history-section" aria-label="Workflow progress">
          <div className="history-section-head">
            <h2 className="history-heading">Workflows</h2>
            <span className="history-count">{openRuns.length} tracked</span>
          </div>

          {openRuns.length === 0 && (
            <div className="history-empty">
              <p>No workflows started yet. Open a card in the Workflow Gallery to build one.</p>
              <Link to="/" className="btn-primary">
                Open the gallery
              </Link>
            </div>
          )}

          <ul className="history-list">
            {openRuns.map((run) => {
              const stats = taskStats(run.steps || [], run.completedTaskIds || []);
              return (
                <li key={run.id} className="history-item">
                  <div className="history-item-head">
                    <button
                      type="button"
                      className="history-item-toggle"
                      onClick={() => setActiveWorkflowId(run.workflowId)}
                    >
                      <span className="history-goal">{run.intent || run.workflowId}</span>
                      <span className="history-meta">
                        {run.category} · {stats.done}/{stats.total} tasks
                        {run.status === 'complete' ? ' · complete' : ' · in progress'}
                      </span>
                    </button>
                    <span className="history-percent">{stats.percent}%</span>
                  </div>
                  <div className="history-bar" aria-hidden="true">
                    <span className="history-bar-fill" style={{ width: `${stats.percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <AnimatePresence>
        {activeWorkflowId && (
          <WorkflowModal
            key={activeWorkflowId}
            workflowId={activeWorkflowId}
            autoResume
            onClose={() => {
              setActiveWorkflowId(null);
              refreshRuns();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;
