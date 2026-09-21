/* ============================================================
   FLOWSTATE — WORKFLOW ENGINE
   The one place the rest of the app asks FlowState to understand an
   intention and turn it into a workflow.

     analyzeIntent()      intention -> { intent, subject, focusAreas, summary }
     generateWorkflow()   intention -> { steps, focusAreas, source }

   Both functions try the configured AI provider first and fall back to the
   deterministic plan engine in ./config.js. The gallery workflow experience
   is therefore always fully usable, with or without an API key — and a real
   provider can be plugged in without touching the UI.

   To swap providers, register an adapter:

     setWorkflowAiAdapter({
       analyze: (payload) => Promise<{ intent, summary, focusAreas }>,
       generate: (payload) => Promise<{ steps, focusAreas }>,
     });

   The default adapter is FlowState's own backend (`POST /ai/workflow/...`),
   which keeps the AI key on the server where it belongs.
   ============================================================ */

import { api } from '../api/client.js';
import { FRAMEWORK_PHASES, getWorkflow, inferFocusAreas } from './config.js';
import {
  asStringList,
  cleanIntent,
  extractSubject,
  normalizeSteps,
  reconcileTaskIds,
} from './deterministic.js';

export {
  allTasks,
  cleanIntent,
  extractSubject,
  normalizePhase,
  normalizeSteps,
  reconcileTaskIds,
  taskStats,
  toggleTaskId,
} from './deterministic.js';

/**
 * AI calls are capped so a cold backend cannot hold the UI hostage. The
 * built-in plan is strong enough that waiting out a 60s Render cold start is
 * worse than falling back: past these limits the deterministic plan is used.
 */
const ANALYZE_TIMEOUT_MS = 12000;
const GENERATE_TIMEOUT_MS = 25000;

/* ------------------------------------------------------------
   AI adapter (default: the FlowState backend)
   ------------------------------------------------------------ */

const defaultAdapter = {
  async analyze(payload) {
    const response = await api.post('/ai/workflow/intent', payload, { timeout: ANALYZE_TIMEOUT_MS });
    if (!response.data?.success) throw new Error(response.data?.error || 'Intent analysis failed');
    return response.data.data || {};
  },
  async generate(payload) {
    const response = await api.post('/ai/workflow/plan', payload, { timeout: GENERATE_TIMEOUT_MS });
    if (!response.data?.success) throw new Error(response.data?.error || 'Workflow generation failed');
    return response.data.data || {};
  },
};

let aiAdapter = defaultAdapter;

export function setWorkflowAiAdapter(adapter) {
  aiAdapter = adapter || defaultAdapter;
}

/* ------------------------------------------------------------
   Public API
   ------------------------------------------------------------ */

function answerSummary(workflow, answers = {}) {
  const parts = [];
  for (const question of workflow?.questions || []) {
    const value = answers[question.id];
    if (value === undefined || value === null || value === '') continue;
    if (question.type === 'number') {
      parts.push(`${question.label}: ${question.prefix || ''}${Number(value).toLocaleString('en-IN')}`);
    } else {
      parts.push(String(value));
    }
  }
  return parts;
}

/**
 * Understand an intention. Never throws for provider reasons: on any failure
 * the built-in interpretation is returned with source "builtin".
 */
export async function analyzeIntent({ intent, workflowId, answers = {} } = {}) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) throw new Error(`Unknown workflow: ${workflowId}`);

  const cleaned = cleanIntent(intent);
  const subject = extractSubject(cleaned);

  const builtin = {
    intent: cleaned,
    subject,
    focusAreas: inferFocusAreas(workflow, cleaned),
    summary: `Read as a ${workflow.category.toLowerCase()} goal around ${subject.toLowerCase()}.`,
    inputs: answerSummary(workflow, answers),
    source: 'builtin',
  };

  try {
    const remote = await aiAdapter.analyze({
      intent: cleaned,
      workflowId,
      category: workflow.category,
      answers,
    });
    const focusAreas = asStringList(remote.focusAreas, 6);
    return {
      ...builtin,
      intent: cleanIntent(remote.intent) || cleaned,
      summary: String(remote.summary || '').trim() || builtin.summary,
      focusAreas: focusAreas.length >= 2 ? focusAreas : builtin.focusAreas,
      source: 'ai',
    };
  } catch {
    return builtin;
  }
}

/**
 * Generate the workflow. Always resolves with usable steps: if the provider
 * fails, is unreachable, or returns something unusable, the deterministic
 * plan for that category is used instead.
 */
export async function generateWorkflow({ intent, workflowId, answers = {}, analysis = null } = {}) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) throw new Error(`Unknown workflow: ${workflowId}`);

  const cleaned = analysis?.intent || cleanIntent(intent);
  const subject = analysis?.subject || extractSubject(cleaned);
  const builtinSteps = normalizeSteps(workflow.build({ intent: cleaned, subject, answers }));
  const builtinFocus = analysis?.focusAreas?.length
    ? analysis.focusAreas
    : inferFocusAreas(workflow, cleaned);

  const builtin = {
    steps: builtinSteps,
    stepCount: builtinSteps.length,
    focusAreas: builtinFocus,
    source: 'builtin',
  };

  try {
    const remote = await aiAdapter.generate({
      intent: cleaned,
      subject,
      workflowId,
      category: workflow.category,
      answers,
      focusAreas: builtinFocus,
      framework: FRAMEWORK_PHASES.map((phase) => phase.id),
    });

    const steps = normalizeSteps(remote.steps, { source: 'ai' });
    if (steps.length < 3) return builtin;

    const remoteFocus = asStringList(remote.focusAreas, 6);
    return {
      steps,
      stepCount: steps.length,
      focusAreas: remoteFocus.length >= 2 ? remoteFocus : builtinFocus,
      source: 'ai',
    };
  } catch {
    return builtin;
  }
}

/** Rebuild a stored run so old ids can never collide with a regenerated plan. */
export function rehydrateRun(run, workflow) {
  const steps = normalizeSteps(run?.steps || []);
  return {
    ...run,
    steps: steps.length ? steps : normalizeSteps(workflow?.build({ intent: run?.intent || '', subject: run?.subject || '', answers: run?.answers || {} }) || []),
    completedTaskIds: reconcileTaskIds(steps, run?.completedTaskIds || []),
  };
}
