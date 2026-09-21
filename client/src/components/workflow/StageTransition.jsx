import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FRAMEWORK_PHASES } from '../../workflows/config.js';

/* The processing state between stages: the five phases lighting up in order. */
const StageTransition = ({ title, lines = [], ...motionProps }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div className="wf-stage wf-stage-centered" {...motionProps} aria-live="polite">
      <div className="wf-scan" aria-hidden="true">
        {FRAMEWORK_PHASES.map((phase, index) => (
          <motion.span
            key={phase.id}
            className="wf-scan-dot"
            animate={reduceMotion ? { opacity: 1 } : { opacity: [0.2, 1, 0.2] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.6, repeat: Infinity, delay: index * 0.16, ease: 'easeInOut' }
            }
          />
        ))}
      </div>

      <h2 className="wf-h3">{title}</h2>

      <ul className="wf-transition-lines">
        {lines.map((line, index) => (
          <motion.li
            key={line}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.25 + index * 0.35, duration: 0.4 }}
            className="wf-meta"
          >
            {line}
          </motion.li>
        ))}
      </ul>

      <span className="wf-visually-hidden" role="status">
        {title}
      </span>
    </motion.div>
  );
};

export default StageTransition;
