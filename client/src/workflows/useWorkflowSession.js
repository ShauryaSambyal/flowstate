/* ============================================================
   FLOWSTATE — WORKFLOW SESSION
   The state machine behind the workflow experience:

     intro -> intent -> analyzing -> analysis -> generating -> workflow -> complete

   It owns the user's intention, the optional answers, the generated
   workflow, completed tasks and persistence. It intentionally knows
   nothing about layout, so the same session could drive any presentation.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWorkflow } from './config.js';
import {
  analyzeIntent,
  cleanIntent,
  generateWorkflow,
  rehydrateRun,
  taskStats,
  toggleTaskId,
} from './engine.js';
import {
  GUEST_SCOPE,
  clearDraft,
  deleteRemoteRun,
  fetchRemoteRuns,
  listRuns,
  mergeRuns,
  pruneDraftRuns,
  pushRemoteRun,
  readDraft,
  removeRun,
  sortRuns,
  upsertRun,
  writeDraft,
} from './persistence.js';

export const STAGES = {
  INTRO: 'intro',
  INTENT: 'intent',
  ANALYZING: 'analyzing',
  ANALYSIS: 'analysis',
  GENERATING: 'generating',
  WORKFLOW: 'workflow',
  ERROR: 'error',
  COMPLETE: 'complete',
};

/** The four markers shown in the modal header, mapped from the internal stages. */
export const STAGE_GROUPS = [
  { id: 'intro', label: 'Intro' },
  { id: 'intent', label: 'Intent' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'complete', label: 'Completion' },
];

export function stageGroupIndex(stage) {
  if (stage === STAGES.INTRO) return 0;
  if (stage === STAGES.COMPLETE) return 3;
  if (stage === STAGES.WORKFLOW) return 2;
  return 1;
}

function transitionDelay() {
  if (typeof window === 'undefined') return 0;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 200 : 900;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultAnswers(workflow) {
  const answers = {};
  for (const question of workflow?.questions || []) {
    answers[question.id] = question.default;
  }
  return answers;
}

function newRunId(workflowId) {
  return `${workflowId}-${Date.now().toString(36)}`;
}

export function useWorkflowSession(workflowId) {
  const workflow = useMemo(() => getWorkflow(workflowId), [workflowId]);

  const [stage, setStage] = useState(STAGES.INTRO);
  const [intent, setIntent] = useState('');
  const [answers, setAnswers] = useState(() => defaultAnswers(workflow));
  const [analysis, setAnalysis] = useState(null);
  const [plan, setPlan] = useState(null);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [account, setAccount] = useState({ email: null, uid: null });
  const [store, setStore] = useState({ scope: null, runs: [], draft: null });

  const runIdRef = useRef(null);
  const requestRef = useRef(0);

  const scope = account.uid || GUEST_SCOPE;

  /* ---- Who is signed in (optional, for cross-device sync) ---- */
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
        const [firebaseModule, authModule] = await Promise.all([
          import('../../firebase.js'),
          import('firebase/auth'),
        ]);
        if (cancelled) return;
        unsubscribe = authModule.onAuthStateChanged(firebaseModule.auth, (user) => {
          if (cancelled) return;
          setAccount({ email: user?.email || null, uid: user?.uid || null });
        });
      } catch {
        /* No Firebase config — local-only persistence still works. */
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* ---- Hydrate whatever this account already has stored ---- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const local = listRuns(scope);
      let merged = local;
      if (account.email) {
        const remote = await fetchRemoteRuns(account.email);
        if (remote.length) {
          merged = mergeRuns(local, remote);
          merged.forEach((run) => upsertRun(scope, run));
        }
      }
      if (cancelled) return;
      setStore({ scope, runs: sortRuns(merged), draft: readDraft(scope, workflow?.id) });
    })();

    return () => {
      cancelled = true;
    };
  }, [scope, account.email, workflow]);

  /* ---- Keep typed intent and answers between sessions ---- */
  useEffect(() => {
    if (!workflow || plan || !intent.trim()) return;
    writeDraft(scope, workflow.id, { intent, answers, stage });
  }, [scope, workflow, plan, intent, answers, stage]);

  const persistRun = useCallback(
    (run) => {
      upsertRun(scope, run);
      setStore((current) => ({
        ...current,
        runs: sortRuns([run, ...current.runs.filter((item) => item.id !== run.id)]),
      }));
      if (account.email) pushRemoteRun(account.email, run);
    },
    [scope, account.email]
  );

  const buildRun = useCallback(
    (nextStatus, steps, completed, generatedPlan, answersOverride) => {
      const now = new Date().toISOString();
      const existing = store.runs.find((run) => run.id === runIdRef.current);
      return {
        id: runIdRef.current || newRunId(workflow.id),
        workflowId: workflow.id,
        category: workflow.category,
        intent,
        subject: analysis?.subject || cleanIntent(intent),
        focusAreas: analysis?.focusAreas || generatedPlan?.focusAreas || [],
        answers: answersOverride || answers,
        steps,
        completedTaskIds: completed,
        totalTasks: steps.flatMap((step) => step.tasks || []).length,
        status: nextStatus,
        source: generatedPlan?.source || 'builtin',
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
    },
    [workflow, intent, analysis, answers, store.runs]
  );

  /* ---- Actions ---- */

  const begin = useCallback(() => {
    setError(null);
    setStage(STAGES.INTENT);
  }, []);

  const updateAnswer = useCallback(
    (questionId, value) => {
      const next = { ...answers, [questionId]: value };
      setAnswers(next);
      // An answer can still be adjusted once the workflow exists (the savings
      // slider), so the stored run has to follow it.
      if (plan?.steps?.length) {
        persistRun(buildRun(status, plan.steps, completedTaskIds, plan, next));
      }
    },
    [answers, plan, status, completedTaskIds, persistRun, buildRun]
  );

  // Takes an optional intent so the error state can offer an example workflow.
  const submitIntent = useCallback(async (rawIntent) => {
    const cleaned = cleanIntent(rawIntent ?? intent);
    if (!cleaned) return;
    const token = requestRef.current + 1;
    requestRef.current = token;

    setIntent(cleaned);
    setError(null);
    setBusy(true);
    setStage(STAGES.ANALYZING);
    setPlan(null);
    setCompletedTaskIds([]);
    setStatus('draft');
    runIdRef.current = null;

    const [result] = await Promise.all([
      analyzeIntent({ intent: cleaned, workflowId: workflow.id, answers }),
      wait(transitionDelay()),
    ]);

    if (requestRef.current !== token) return;
    setAnalysis(result);
    setStage(STAGES.ANALYSIS);
    setBusy(false);
  }, [intent, answers, workflow]);

  const confirmAnalysis = useCallback(async () => {
    // Already generated for this intent — going back and forward keeps progress.
    if (plan?.steps?.length) {
      setStage(STAGES.WORKFLOW);
      return;
    }

    const token = requestRef.current + 1;
    requestRef.current = token;

    setError(null);
    setBusy(true);
    setStage(STAGES.GENERATING);

    const [result] = await Promise.all([
      generateWorkflow({ intent, workflowId: workflow.id, answers, analysis }),
      wait(Math.round(transitionDelay() * 1.2)),
    ]);

    if (requestRef.current !== token) return;
    setBusy(false);

    if (!result?.steps?.length) {
      setError({
        message: 'Something went wrong while generating your workflow.',
        retry: 'analysis',
      });
      setStage(STAGES.ERROR);
      return;
    }

    const run = buildRun('draft', result.steps, [], result);
    runIdRef.current = run.id;
    pruneDraftRuns(scope, workflow.id, run.id);
    persistRun(run);
    clearDraft(scope, workflow.id);

    setPlan(result);
    setStage(STAGES.WORKFLOW);
  }, [plan, intent, answers, analysis, workflow, scope, buildRun, persistRun]);

  const startWorkflow = useCallback(() => {
    if (!plan) return;
    setStatus('active');
    persistRun(buildRun('active', plan.steps, completedTaskIds, plan));
  }, [plan, completedTaskIds, buildRun, persistRun]);

  const toggleTask = useCallback(
    (taskId) => {
      if (!plan) return;
      const next = toggleTaskId(completedTaskIds, taskId, !completedTaskIds.includes(taskId));
      const stats = taskStats(plan.steps, next);
      const nextStatus = stats.complete ? 'complete' : 'active';

      setCompletedTaskIds(next);
      setStatus(nextStatus);
      persistRun(buildRun(nextStatus, plan.steps, next, plan));
      if (stats.complete) setStage(STAGES.COMPLETE);
    },
    [plan, completedTaskIds, buildRun, persistRun]
  );

  const resumeStoredRun = useCallback(
    (run) => {
      if (!run || run.workflowId !== workflow?.id) return;
      const safe = rehydrateRun(run, workflow);
      requestRef.current += 1;
      runIdRef.current = safe.id;
      setIntent(safe.intent || '');
      setAnswers({ ...defaultAnswers(workflow), ...(safe.answers || {}) });
      setAnalysis({
        intent: safe.intent || '',
        subject: safe.subject || '',
        focusAreas: safe.focusAreas || [],
        summary: 'Resuming a workflow you already started.',
        source: safe.source || 'builtin',
      });
      setPlan({ steps: safe.steps, focusAreas: safe.focusAreas || [], source: safe.source || 'builtin' });
      setCompletedTaskIds(safe.completedTaskIds);
      setStatus(safe.status || 'active');
      setError(null);
      setBusy(false);
      setStage(
        taskStats(safe.steps, safe.completedTaskIds).complete ? STAGES.COMPLETE : STAGES.WORKFLOW
      );
    },
    [workflow]
  );

  const resumeDraft = useCallback(
    (draft) => {
      if (!draft?.intent) return;
      setIntent(draft.intent);
      setAnswers((current) => ({ ...current, ...(draft.answers || {}) }));
      setStage(STAGES.INTENT);
    },
    []
  );

  const discardStoredRun = useCallback(
    (run) => {
      if (!run) return;
      removeRun(scope, run.id);
      if (account.email) deleteRemoteRun(account.email, run.id);
      setStore((current) => ({ ...current, runs: current.runs.filter((item) => item.id !== run.id) }));
    },
    [scope, account.email]
  );

  const startAnother = useCallback(() => {
    runIdRef.current = null;
    setIntent('');
    setAnswers(defaultAnswers(workflow));
    setAnalysis(null);
    setPlan(null);
    setCompletedTaskIds([]);
    setStatus('draft');
    setError(null);
    setBusy(false);
    setStage(STAGES.INTENT);
    if (workflow) clearDraft(scope, workflow.id);
  }, [workflow, scope]);

  const back = useCallback(() => {
    // Leaving a stage abandons any request it started, and its spinner too —
    // otherwise the footer would stay hidden on the stage we land on.
    requestRef.current += 1;
    setBusy(false);
    setError(null);
    setStage((current) => {
      switch (current) {
        case STAGES.INTENT:
          return STAGES.INTRO;
        case STAGES.ANALYSIS:
          return STAGES.INTENT;
        case STAGES.WORKFLOW:
          return STAGES.ANALYSIS;
        case STAGES.ERROR:
          return STAGES.ANALYSIS;
        default:
          return current;
      }
    });
  }, []);

  const retry = useCallback(() => {
    if (error?.retry === 'analysis') confirmAnalysis();
    else submitIntent();
  }, [error, confirmAnalysis, submitIntent]);

  return {
    workflow,
    workflowId,
    scope,
    account,
    stage,
    groupIndex: stageGroupIndex(stage),
    stageGroups: STAGE_GROUPS,
    busy,
    error,
    intent,
    setIntent,
    answers,
    updateAnswer,
    analysis,
    plan,
    source: plan?.source || 'builtin',
    completedTaskIds,
    status,
    progress: taskStats(plan?.steps || [], completedTaskIds),
    storedRuns: store.runs,
    storedRun: store.runs.find((run) => run.workflowId === workflow?.id) || null,
    draft: store.draft,
    hydrated: store.scope === scope,
    begin,
    back,
    submitIntent,
    confirmAnalysis,
    startWorkflow,
    toggleTask,
    startAnother,
    retry,
    resumeStoredRun,
    resumeDraft,
    discardStoredRun,
    canContinue: Boolean(intent.trim()),
  };
}
