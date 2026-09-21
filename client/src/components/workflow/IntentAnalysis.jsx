import React from 'react';
import { motion } from 'framer-motion';

/* STEP 3 — what FlowState understood, and the focus areas it will plan around. */
const IntentAnalysis = ({ session, onEdit, ...motionProps }) => {
  const { workflow, analysis, answers, source } = session;

  const answerChips = (workflow.questions || [])
    .map((question) => {
      const value = answers[question.id];
      if (value === undefined || value === null || value === '') return null;
      if (question.type === 'number') {
        return `${question.label}: ${question.prefix || ''}${Number(value).toLocaleString('en-IN')}`;
      }
      return value;
    })
    .filter(Boolean);

  return (
    <motion.div className="wf-stage" {...motionProps}>
      <p className="wf-eyebrow">Intent detected</p>
      <h2 className="wf-quote">&ldquo;{analysis?.intent || session.intent}&rdquo;</h2>
      <p className="wf-body wf-body-tight">{analysis?.summary}</p>

      <div className="wf-block">
        <p className="wf-block-label">Focus areas</p>
        <ul className="wf-focus-list">
          {(analysis?.focusAreas || []).map((area) => (
            <li key={area} className="wf-focus-item">
              <span className="wf-check" aria-hidden="true">
                ✓
              </span>
              {area}
            </li>
          ))}
        </ul>
      </div>

      {answerChips.length > 0 && (
        <div className="wf-block">
          <p className="wf-block-label">Inputs</p>
          <div className="wf-chips">
            {answerChips.map((chip) => (
              <span key={chip} className="wf-chip wf-chip-static">
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="wf-meta wf-meta-quiet">
        {source === 'ai' ? 'Interpreted by FlowState AI' : 'Interpreted by the built-in FlowState engine'}
        <button type="button" className="wf-link wf-link-inline" onClick={onEdit}>
          Edit intent
        </button>
      </p>
    </motion.div>
  );
};

export default IntentAnalysis;
