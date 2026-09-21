import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ProgressTracker = ({ progress, category }) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="wf-progress" aria-label="Workflow progress">
      <div className="wf-progress-head">
        <p className="wf-eyebrow">Your progress</p>
        <p className="wf-progress-count">
          <strong>{progress.done}</strong> / {progress.total} tasks completed
        </p>
      </div>

      <div
        className="wf-progress-track"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category} workflow progress`}
      >
        <motion.div
          className="wf-progress-fill"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <p className="wf-progress-percent" aria-hidden="true">
        {progress.percent}%
      </p>
    </section>
  );
};

export default ProgressTracker;
