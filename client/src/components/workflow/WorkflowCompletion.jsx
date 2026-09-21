import React from 'react';
import { motion } from 'framer-motion';

/* STEP 7 — done. No confetti: one quiet confirmation and a way forward. */
const WorkflowCompletion = ({ session, onStartAnother, onBackToGallery, ...motionProps }) => {
  const { workflow, analysis, intent, progress } = session;

  const rows = [
    'Workflow completed',
    `${progress.total} tasks completed`,
    'Progress tracked',
  ];

  return (
    <motion.div className="wf-stage wf-stage-centered" {...motionProps}>
      <p className="wf-eyebrow">Workflow complete</p>
      <h2 className="wf-h1 wf-h1-complete">You turned an intention into action.</h2>

      <p className="wf-quote wf-quote-small">&ldquo;{analysis?.intent || intent}&rdquo;</p>

      <ul className="wf-complete-list">
        {rows.map((row) => (
          <li key={row} className="wf-complete-row">
            <span className="wf-check" aria-hidden="true">
              ✓
            </span>
            {row}
          </li>
        ))}
      </ul>

      <p className="wf-meta">{workflow.category} · {progress.percent}% of actions checked off</p>

      <div className="wf-inline-actions wf-inline-actions-center">
        <button type="button" className="wf-btn wf-btn-primary" onClick={onStartAnother}>
          Start Another Workflow
        </button>
        <button type="button" className="wf-btn wf-btn-ghost" onClick={onBackToGallery}>
          Back to Gallery
        </button>
      </div>
    </motion.div>
  );
};

export default WorkflowCompletion;
