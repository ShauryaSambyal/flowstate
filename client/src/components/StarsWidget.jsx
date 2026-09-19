import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StarsWidget.css';

const BADGE_THRESHOLD = 100;

const StarsWidget = ({ stars = 0, isGuest = false, loading = false, burst = false, onSignIn }) => {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = () => {
    if (isGuest) {
      onSignIn?.();
      return;
    }
    setOpen((v) => !v);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  const progressPercent = Math.min((stars / BADGE_THRESHOLD) * 100, 100);
  const displayCount = isGuest ? '—' : loading ? '–' : stars;

  return (
    <div className="stars-widget" ref={widgetRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`stars-btn ${burst ? 'stars-burst' : ''} ${isGuest ? 'is-disabled' : ''}`}
        onClick={handleButtonClick}
        aria-label={isGuest ? 'Sign in to collect stars' : 'View stars'}
        aria-expanded={isGuest ? undefined : open}
        title={isGuest ? 'Sign in to collect stars' : undefined}
      >
        <span className="stars-icon">⭐</span>
        <span className="stars-count">{displayCount}</span>
      </button>

      <AnimatePresence>
        {open && !isGuest && (
          <motion.div
            className="stars-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="stars-dd-header">
              <span className="stars-dd-title">Your Stars</span>
              <span className="stars-dd-count">⭐ {stars}</span>
            </div>

            <div className="stars-progress-wrap">
              <div className="stars-progress-bar">
                <motion.div
                  className="stars-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="stars-progress-label">{stars} / {BADGE_THRESHOLD}</div>
            </div>

            <div className="stars-dd-msg">
              {stars >= BADGE_THRESHOLD ? (
                <span className="stars-badge-earned">🏆 Badge Unlocked! You&apos;re a Flow Master!</span>
              ) : (
                <>
                  <span className="stars-milestone-icon">🏅</span>
                  <span>Reach <strong>{BADGE_THRESHOLD} stars</strong> to earn a badge that showcases your accomplishments!</span>
                </>
              )}
            </div>

            {stars >= BADGE_THRESHOLD && (
              <div className="stars-badge-display">
                <div className="badge-icon">🏆</div>
                <div className="badge-label">Flow Master</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarsWidget;