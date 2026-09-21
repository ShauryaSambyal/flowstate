import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PHASE_BY_ID } from '../../workflows/config.js';
import WorkflowTask from './WorkflowTask.jsx';

/* One phase of the generated workflow. Collapsed it reads as a card in the
   timeline; expanded it holds the detail, the actions and any resources. */
const WorkflowStep = ({ step, index, tasksEnabled, completedTaskIds, onToggleTask, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const panelId = `${useId()}-panel`;

  const tasks = step.tasks || [];
  const done = tasks.filter((task) => completedTaskIds.includes(task.id)).length;
  const phase = PHASE_BY_ID[step.phase] || PHASE_BY_ID.plan;
  const allDone = tasks.length > 0 && done === tasks.length;

  return (
    <li className={`wf-step${open ? ' is-open' : ''}${allDone ? ' is-complete' : ''}`}>
      <button
        type="button"
        className="wf-step-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="wf-step-index">{String(index + 1).padStart(2, '0')}</span>

        <span className="wf-step-main">
          <span className="wf-step-phase">{phase.label}</span>
          <span className="wf-step-title">{step.title}</span>
          {step.summary && <span className="wf-step-summary">{step.summary}</span>}
        </span>

        <span className="wf-step-meta">
          {tasks.length > 0 && (
            <span className="wf-step-count">
              {done}/{tasks.length}
            </span>
          )}
          <span className="wf-step-toggle-label">{open ? 'Hide Details' : 'View Details'}</span>
          <span className="wf-step-chevron" aria-hidden="true" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="wf-step-panel"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
          >
            <div className="wf-step-panel-inner">
              {step.details?.length > 0 && (
                <ul className="wf-step-details">
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}

              {tasks.length > 0 && (
                <div className="wf-step-tasks">
                  {tasks.map((task) => (
                    <WorkflowTask
                      key={task.id}
                      task={task}
                      completed={completedTaskIds.includes(task.id)}
                      disabled={!tasksEnabled}
                      onToggle={onToggleTask}
                    />
                  ))}
                </div>
              )}

              {step.resources?.length > 0 && (
                <div className="wf-step-resources">
                  {step.resources.map((resource) => (
                    <span key={resource.label} className="wf-resource">
                      <span className="wf-resource-label">{resource.label}</span>
                      {resource.note && <span className="wf-resource-note">{resource.note}</span>}
                    </span>
                  ))}
                </div>
              )}

              {!tasksEnabled && <p className="wf-meta wf-meta-quiet">Start the workflow to tick these off.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default WorkflowStep;
