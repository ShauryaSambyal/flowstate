/* ============================================================
   FLOWSTATE — PURE WORKFLOW PRIMITIVES
   Everything here is deterministic and dependency-free: intention
   cleaning, normalisation of any step source, and the progress maths.
   Keeping it separate from ./engine.js means the plan logic can be
   reasoned about (and tested) without React, axios or a network.
   ============================================================ */

import { FRAMEWORK_PHASES } from './config.js';

const PHASE_IDS = FRAMEWORK_PHASES.map((phase) => phase.id);

const FILLER_PREFIXES = [
  /^i\s+(?:just\s+|really\s+)?(?:want|need|would\s+like|'d\s+like|wanna|wish|plan)\s+to\s+/i,
  /^i\s+(?:just\s+)?(?:want|need|would\s+like)\s+/i,
  /^i\s+am\s+trying\s+to\s+/i,
  /^help\s+me\s+(?:to\s+)?/i,
  /^(?:can|could)\s+you\s+(?:help\s+me\s+)?/i,
  /^how\s+do\s+i\s+/i,
  /^please\s+/i,
];

const LEADING_VERBS =
  /^(?:to\s+)?(?:build|create|make|start|begin|improve|become|get|learn|study|master|practice|practise|prepare(?:\s+for)?|organi[sz]e|finish|complete|plan|track|manage|reduce|set|achieve|save(?:\s+for)?|stop|break\s+down|work\s+on|write|read)\s+(?:a\s+|an\s+|the\s+|my\s+|our\s+|some\s+|this\s+)?/i;

function tidySentence(text) {
  const trimmed = String(text || '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** "i need to prepare for my DBMS exam." -> "Prepare for my DBMS exam" */
export function cleanIntent(raw) {
  let text = String(raw || '').replace(/\s+/g, ' ').trim();
  text = text.replace(/[.!?]+$/, '');
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of FILLER_PREFIXES) {
      if (pattern.test(text)) {
        text = text.replace(pattern, '');
        changed = true;
      }
    }
  }
  return tidySentence(text.replace(/^[,;:\s-]+/, ''));
}

/** "Build better habits" -> "better habits". Used to fill the plan templates. */
export function extractSubject(intent) {
  let text = String(intent || '').trim();
  const stripped = text.replace(LEADING_VERBS, '').trim();
  if (stripped.length >= 3) text = stripped;
  text = text.replace(/^(?:a|an|the|my|our)\s+/i, '').trim();
  return text.replace(/[.!?]+$/, '').trim() || String(intent || '').trim();
}

/* ---------- Normalisation of any step source ---------- */

export function normalizePhase(value, fallback = 'plan') {
  const key = String(value || '')
    .toLowerCase()
    .trim();
  if (PHASE_IDS.includes(key)) return key;
  return PHASE_IDS.find((id) => key.includes(id)) || fallback;
}

export function asStringList(value, limit = 6) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry : entry?.label || entry?.title || ''))
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildTasks(stepId, labels) {
  return asStringList(labels, 8).map((label, index) => ({
    id: `${stepId}.${index + 1}`,
    label,
  }));
}

function buildResources(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return { label: entry, note: '' };
      return { label: String(entry?.label || '').trim(), note: String(entry?.note || '').trim() };
    })
    .filter((entry) => entry.label)
    .slice(0, 3);
}

/** Fallback phase for steps that arrive without one: walks the phases in order. */
export function phaseForIndex(index) {
  const ratio = Math.min(index / 5, 0.99);
  return PHASE_IDS[Math.floor(ratio * PHASE_IDS.length)] || 'plan';
}

/**
 * Rebuild steps from any source (built-in plan or AI) into the single shape the
 * UI expects. `tasks`, `details` and `resources` are optional everywhere.
 */
export function normalizeSteps(rawSteps, { source = 'builtin' } = {}) {
  if (!Array.isArray(rawSteps)) return [];
  return rawSteps
    .map((raw, index) => {
      if (!raw || typeof raw !== 'object') return null;
      const title = String(raw.title || raw.name || '').trim();
      if (!title) return null;
      const id =
        String(raw.id || `step-${index + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-+|-+$/g, '') || `step-${index + 1}`;
      return {
        id,
        order: index + 1,
        phase: normalizePhase(raw.phase || raw.stage, phaseForIndex(index)),
        title,
        summary: String(raw.summary || raw.description || '').trim(),
        details: asStringList(raw.bullets || raw.notes || raw.details, 4),
        tasks: buildTasks(id, raw.tasks),
        resources: buildResources(raw.resources),
        source,
      };
    })
    .filter(Boolean)
    .slice(0, 10);
}

/* ---------- Progress maths ---------- */

export function allTasks(steps = []) {
  return steps.flatMap((step) => step.tasks || []);
}

export function taskStats(steps = [], completedTaskIds = []) {
  const tasks = allTasks(steps);
  const total = tasks.length;
  const done = tasks.filter((task) => completedTaskIds.includes(task.id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent, complete: total > 0 && done >= total };
}

/** Add or remove one task id. */
export function toggleTaskId(completedTaskIds = [], taskId, completed) {
  const next = new Set(completedTaskIds);
  if (completed) next.add(taskId);
  else next.delete(taskId);
  return Array.from(next);
}

/** Drop completed ids that no longer exist in the current plan. */
export function reconcileTaskIds(steps = [], completedTaskIds = []) {
  const known = new Set(allTasks(steps).map((task) => task.id));
  return completedTaskIds.filter((taskId) => known.has(taskId));
}
