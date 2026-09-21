import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { STAGES, useWorkflowSession } from '../../workflows/useWorkflowSession.js';
import WorkflowIntro from './WorkflowIntro.jsx';
import IntentInput from './IntentInput.jsx';
import IntentAnalysis from './IntentAnalysis.jsx';
import StageTransition from './StageTransition.jsx';
import WorkflowTimeline from './WorkflowTimeline.jsx';
import WorkflowCompletion from './WorkflowCompletion.jsx';
import './WorkflowModal.css';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/* The panel is a full-screen dark surface in every mode/theme, so it reads as
   the same premium block as the Workflow Gallery it opens from. */
const WorkflowModal = ({ workflowId, onClose }) => {
  const session = useWorkflowSession(workflowId);
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { workflow, stage, busy, canContinue } = session;

  /* ---- Escape closes; Tab stays inside the panel ---- */
  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      const target = panel?.querySelector('[data-autofocus]') || panel;
      target?.focus?.();
    }, 80);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  /* ---- Move focus to the new stage once the previous one has left ---- */
  const mountedStageRef = useRef(stage);
  useEffect(() => {
    if (mountedStageRef.current === stage) return undefined;
    mountedStageRef.current = stage;
    // Stages cross-fade, so wait for the outgoing stage to finish first.
    const timer = window.setTimeout(
      () => panelRef.current?.querySelector('[data-autofocus]')?.focus?.(),
      reduceMotion ? 120 : 380
    );
    return () => window.clearTimeout(timer);
  }, [stage, reduceMotion]);

  /* ---- Lock the page behind the panel, then restore the exact position ---- */
  useEffect(() => {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!workflow) return null;

  const stageMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.28, ease: 'easeOut' },
      };

  const renderStage = () => {
    switch (stage) {
      case STAGES.INTRO:
        return (
          <WorkflowIntro
            key="intro"
            {...stageMotion}
            session={session}
            onStart={session.begin}
          />
        );
      case STAGES.INTENT:
        return <IntentInput key="intent" {...stageMotion} session={session} />;
      case STAGES.ANALYZING:
        return (
          <StageTransition
            key="analyzing"
            {...stageMotion}
            title="Understanding your intent"
            lines={[
              'Reading what you actually want to change',
              'Mapping it onto the FlowState framework',
            ]}
          />
        );
      case STAGES.GENERATING:
        return (
          <StageTransition
            key="generating"
            {...stageMotion}
            title="Building your workflow"
            lines={[
              `Structuring ${workflow.category.toLowerCase()} into phases`,
              'Turning each phase into actions you can complete',
            ]}
          />
        );
      case STAGES.ANALYSIS:
        return <IntentAnalysis key="analysis" {...stageMotion} session={session} onEdit={() => session.back()} />;
      case STAGES.WORKFLOW:
        return <WorkflowTimeline key="workflow" {...stageMotion} session={session} />;
      case STAGES.COMPLETE:
        return (
          <WorkflowCompletion
            key="complete"
            {...stageMotion}
            session={session}
            onStartAnother={session.startAnother}
            onBackToGallery={onClose}
          />
        );
      case STAGES.ERROR:
      default:
        return (
          <div key="error" className="wf-stage wf-stage-centered" {...stageMotion} role="alert">
            <p className="wf-eyebrow">Something broke</p>
            <h3 className="wf-h2">{session.error?.message || 'The workflow could not be generated.'}</h3>
            <p className="wf-body">
              FlowState keeps a built-in plan engine, so you can carry on right away with a working
              example for this category.
            </p>
            <div className="wf-inline-actions">
              <button type="button" className="wf-btn wf-btn-primary" onClick={session.retry}>
                Try Again
              </button>
              <button
                type="button"
                className="wf-btn wf-btn-ghost"
                onClick={() => session.submitIntent(workflow.suggestedIntents[0])}
              >
                Use Example Workflow
              </button>
            </div>
          </div>
        );
    }
  };

  const renderFooter = () => {
    if (busy) return null;

    if (stage === STAGES.INTENT) {
      return (
        <>
          <button type="button" className="wf-btn wf-btn-ghost" onClick={session.back}>
            Back
          </button>
          <button
            type="button"
            className="wf-btn wf-btn-primary"
            onClick={() => session.submitIntent()}
            disabled={!canContinue}
          >
            Continue
            <span aria-hidden="true">→</span>
          </button>
        </>
      );
    }

    if (stage === STAGES.ANALYSIS) {
      return (
        <>
          <button type="button" className="wf-btn wf-btn-ghost" onClick={session.back}>
            Back
          </button>
          <button type="button" className="wf-btn wf-btn-primary" onClick={session.confirmAnalysis}>
            Generate my workflow
            <span aria-hidden="true">→</span>
          </button>
        </>
      );
    }

    return null;
  };

  const footer = renderFooter();

  return createPortal(
    <div className="wf-root" role="presentation">
      <motion.div
        className="wf-backdrop"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        onClick={onClose}
      />

      <motion.div
        className="wf-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${workflow.title} workflow`}
        tabIndex={-1}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <header className="wf-header">
          <div className="wf-header-meta">
            <span className="wf-eyebrow">{workflow.category}</span>
            <ol className="wf-stages" aria-label="Workflow progress">
              {session.stageGroups.map((group, index) => {
                const state =
                  index < session.groupIndex ? 'done' : index === session.groupIndex ? 'current' : 'todo';
                return (
                  <li key={group.id} className={`wf-stage-marker is-${state}`}>
                    <span className="wf-stage-dot" aria-hidden="true" />
                    <span className="wf-stage-name">{group.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <button type="button" className="wf-close" onClick={onClose} aria-label="Close workflow">
            <span aria-hidden="true">✕</span>
            <span className="wf-close-label">Close</span>
          </button>
        </header>

        <div className="wf-body">
          <AnimatePresence mode="wait" initial={false}>
            {renderStage()}
          </AnimatePresence>
        </div>

        {footer && <footer className="wf-footer">{footer}</footer>}
      </motion.div>
    </div>,
    document.body
  );
};

export default WorkflowModal;
