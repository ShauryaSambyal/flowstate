import React from 'react';
import { motion } from 'framer-motion';
import { FRAMEWORK_PHASES } from '../../workflows/config.js';

/* STEP 1 — what this workflow is for, and how FlowState will work through it. */
const WorkflowIntro = ({ session, onStart, ...motionProps }) => {
  const { workflow, storedRun, draft, resumeStoredRun, resumeDraft, discardStoredRun, progress } = session;
  const resumeStats = storedRun
    ? {
        done: (storedRun.completedTaskIds || []).length,
        total: storedRun.steps.flatMap((step) => step.tasks || []).length,
      }
    : null;

  return (
    <motion.div className="wf-stage" {...motionProps}>
      <p className="wf-eyebrow">{workflow.category}</p>
      <h2 className="wf-h1">{workflow.headline}</h2>
      <p className="wf-body">{workflow.description}</p>

      {workflow.notice && <p className="wf-notice">{workflow.notice}</p>}

      <ol className="wf-framework" aria-label="The FlowState framework">
        {FRAMEWORK_PHASES.map((phase) => (
          <li key={phase.id} className="wf-framework-item">
            <span className="wf-framework-index">{phase.index}</span>
            <span className="wf-framework-label">{phase.label}</span>
          </li>
        ))}
      </ol>

      {resumeStats && (
        <div className="wf-resume">
          <div className="wf-resume-copy">
            <p className="wf-eyebrow">In progress</p>
            <p className="wf-resume-title">{storedRun.intent}</p>
            <p className="wf-meta">
              {resumeStats.done} / {resumeStats.total} tasks completed
            </p>
          </div>
          <div className="wf-inline-actions">
            <button type="button" className="wf-btn wf-btn-ghost" onClick={() => resumeStoredRun(storedRun)}>
              Resume
            </button>
            <button
              type="button"
              className="wf-link"
              onClick={() => {
                discardStoredRun(storedRun);
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {!resumeStats && draft?.intent && (
        <div className="wf-resume">
          <div className="wf-resume-copy">
            <p className="wf-eyebrow">Unsaved intent</p>
            <p className="wf-resume-title">{draft.intent}</p>
            <p className="wf-meta">Pick up the intention you typed earlier.</p>
          </div>
          <div className="wf-inline-actions">
            <button type="button" className="wf-btn wf-btn-ghost" onClick={() => resumeDraft(draft)}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="wf-inline-actions wf-inline-actions-start">
        <button type="button" className="wf-btn wf-btn-primary" onClick={onStart} data-autofocus>
          {workflow.cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <p className="wf-meta wf-meta-quiet">
        {progress.total > 0 ? `${progress.total} actions tracked across your last plan` : 'About two minutes, start to finish'}
      </p>
    </motion.div>
  );
};

export default WorkflowIntro;
