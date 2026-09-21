// Checks the deterministic workflow layer (no network, no React).
// Run with: node test_workflow_engine.mjs
import assert from 'node:assert/strict';
import { WORKFLOWS, WORKFLOW_LIST, inferFocusAreas } from './client/src/workflows/config.js';
import {
  cleanIntent,
  extractSubject,
  normalizeSteps,
  taskStats,
  toggleTaskId,
} from './client/src/workflows/deterministic.js';

const PHASES = ['understand', 'breakdown', 'plan', 'act', 'track'];
let failures = 0;

function check(name, actual, expected) {
  if (actual === expected) {
    console.log(`  ok   ${name}`);
    return;
  }
  failures += 1;
  console.error(`  FAIL ${name}\n       expected: ${JSON.stringify(expected)}\n       actual:   ${JSON.stringify(actual)}`);
}

function checkTrue(name, condition) {
  check(name, Boolean(condition), true);
}

function defaultAnswers(workflow) {
  return Object.fromEntries((workflow.questions || []).map((question) => [question.id, question.default]));
}

console.log('\nIntention cleaning');
check('strips conversational filler', cleanIntent('I need to prepare for my DBMS exam.'), 'Prepare for my DBMS exam');
check('strips "i want to"', cleanIntent('i want to build a better daily routine'), 'Build a better daily routine');
check('keeps a bare intent', cleanIntent('  Learn React  '), 'Learn React');
check('handles "help me"', cleanIntent('help me save for a laptop'), 'Save for a laptop');
check('subject drops the leading verb', extractSubject('Prepare for my DBMS exam'), 'DBMS exam');
check('subject keeps the qualifier', extractSubject('Build better habits'), 'better habits');
check('subject of a one-word intent', extractSubject('Learn React'), 'React');

console.log('\nRegistry');
check('six workflows are registered', WORKFLOW_LIST.length, 6);
for (const id of ['personal-life', 'productivity', 'health-fitness', 'career-growth', 'financial-freedom', 'ai-tutor']) {
  checkTrue(`workflow "${id}" exists`, WORKFLOWS[id]?.category && WORKFLOWS[id]?.build);
}

console.log('\nDeterministic plans');
for (const workflow of WORKFLOW_LIST) {
  const ctx = {
    intent: 'Build better habits',
    subject: 'better habits',
    answers: defaultAnswers(workflow),
  };
  const steps = normalizeSteps(workflow.build(ctx));

  checkTrue(`${workflow.id}: at least 5 steps`, steps.length >= 5);
  checkTrue(`${workflow.id}: at most 10 steps`, steps.length <= 10);
  checkTrue(
    `${workflow.id}: every step has a valid phase`,
    steps.every((step) => PHASES.includes(step.phase))
  );
  checkTrue(
    `${workflow.id}: every phase is covered`,
    PHASES.every((phase) => steps.some((step) => step.phase === phase))
  );
  checkTrue(`${workflow.id}: every step has actions`, steps.every((step) => step.tasks.length > 0));
  checkTrue(
    `${workflow.id}: every step has a summary`,
    steps.every((step) => step.title.length > 0 && step.summary.length > 0)
  );

  const taskIds = steps.flatMap((step) => step.tasks.map((task) => task.id));
  checkTrue(`${workflow.id}: task ids are unique`, new Set(taskIds).size === taskIds.length);

  const flattened = JSON.stringify(steps);
  checkTrue(`${workflow.id}: no un-interpolated placeholders`, !flattened.includes('${'));
  checkTrue(`${workflow.id}: no template leakage of "undefined"`, !flattened.includes('undefined'));
}

console.log('\nFocus areas');
const productivity = WORKFLOWS.productivity;
const finance = WORKFLOWS['financial-freedom'];
checkTrue(
  'keyword rules extend the base areas',
  inferFocusAreas(productivity, 'Prepare for my DBMS exam').includes('Exam scope')
);
checkTrue(
  'savings intents map to a saving focus',
  inferFocusAreas(finance, 'Save for a laptop').includes('Goal-based saving')
);
check('focus areas stay bounded', inferFocusAreas(productivity, 'exam deadline project procrastinate').length <= 6, true);

console.log('\nCategory specific behaviour');
const financeSteps = normalizeSteps(
  finance.build({ intent: 'Save for a laptop', subject: 'laptop', answers: { current: 10000, target: 60000, monthly: 5000 } })
);
checkTrue(
  'savings plan reflects the stated numbers',
  financeSteps[0].summary.includes('60,000') && financeSteps[0].summary.includes('10,000')
);
checkTrue('savings plan estimates a horizon', financeSteps[0].summary.includes('10 months'));

const tutor = WORKFLOWS['ai-tutor'];
const countFor = (time) =>
  normalizeSteps(tutor.build({ intent: 'Learn Machine Learning', subject: 'Machine Learning', answers: { time, level: 'Beginner', goal: 'Project' } })).length;
check('30 min/day yields a shorter roadmap', countFor('30 min/day'), 5);
check('1 hour/day yields a medium roadmap', countFor('1 hour/day'), 7);
check('3+ hours/day yields the full roadmap', countFor('3+ hours/day'), 8);

const tutorSteps = normalizeSteps(tutor.build({ intent: 'Learn Machine Learning', subject: 'Machine Learning', answers: {} }));
checkTrue('roadmap steps carry the subject', tutorSteps[0].tasks.some((task) => task.label.includes('Machine Learning')));
checkTrue('roadmap numbers its phases', tutorSteps[0].title.startsWith('01 '));

console.log('\nNormalisation of AI-shaped payloads');
const aiShaped = normalizeSteps(
  [
    { stage: 'UNDERSTAND', name: 'Read the situation', description: 'What is actually true.', tasks: ['Write it down', { label: 'Say it out loud' }] },
    { phase: 'not-a-phase', title: 'Second', bullets: ['note'], resources: [{ label: 'Docs', note: 'skim' }] },
    { title: '   ' },
    { title: 'Third' },
  ],
  { source: 'ai' }
);
check('invalid steps are dropped', aiShaped.length, 3);
check('unknown phase falls back by position', aiShaped[1].phase, 'breakdown');
check('phase casing is normalised', aiShaped[0].phase, 'understand');
check('task objects are unwrapped', aiShaped[0].tasks[1].label, 'Say it out loud');
check('bullets map to details', aiShaped[1].details[0], 'note');
check('resources survive', aiShaped[1].resources[0].label, 'Docs');
check('source is recorded', aiShaped[0].source, 'ai');

console.log('\nProgress maths');
const steps = [
  { id: 'a', tasks: [{ id: 'a.1', label: 'one' }, { id: 'a.2', label: 'two' }] },
  { id: 'b', tasks: [{ id: 'b.1', label: 'three' }] },
];
check('totals count every task', taskStats(steps, []).total, 3);
check('progress is a percentage', taskStats(steps, ['a.1']).percent, 33);
check('incomplete is not complete', taskStats(steps, ['a.1', 'a.2']).complete, false);
check('all tasks completes the workflow', taskStats(steps, ['a.1', 'a.2', 'b.1']).complete, true);
check('unknown ids do not count', taskStats(steps, ['gone']).done, 0);
check('toggling adds', toggleTaskId([], 'a.1', true).length, 1);
check('toggling removes', toggleTaskId(['a.1', 'a.2'], 'a.1', false).join(','), 'a.2');
check('duplicate toggles are ignored', toggleTaskId(['a.1'], 'a.1', true).length, 1);

assert.equal(failures, 0, `${failures} workflow engine check(s) failed`);
console.log('\nAll workflow engine checks passed.');
