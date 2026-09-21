import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* A single actionable item. Native checkbox, so keyboard and screen readers
   already know what it is — the visuals are entirely CSS. */
const WorkflowTask = ({ task, completed, disabled, onToggle }) => {
  const reduceMotion = useReducedMotion();

  return (
    <label className={`wf-task${completed ? ' is-complete' : ''}${disabled ? ' is-locked' : ''}`}>
      <input
        type="checkbox"
        className="wf-task-input"
        checked={completed}
        disabled={disabled}
        onChange={() => onToggle(task.id)}
      />
      <motion.span
        className="wf-task-box"
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: completed ? [1, 1.16, 1] : 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
          <path
            d="M2 6.4 4.6 9 10 3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>
      <span className="wf-task-label">{task.label}</span>
    </label>
  );
};

export default WorkflowTask;
