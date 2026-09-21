/* ============================================================
   FLOWSTATE — WORKFLOW CONFIGURATION
   One entry per Workflow Gallery card. Every entry follows the same
   philosophy (INTENT -> UNDERSTAND -> BREAK DOWN -> PLAN -> ACT -> TRACK);
   only the vocabulary, questions and steps differ.

   `build(ctx)` is the deterministic plan engine. It is the fallback the
   workflow engine falls back to whenever no AI provider is configured or
   reachable — the feature must never depend on a live API.

   ctx = { intent, subject, answers }
     intent   the user's raw intention, cleaned
     subject  a short noun phrase lifted from the intention
     answers  { questionId: value } from the optional questions
   ============================================================ */

/** The five FlowState phases, in order. Category steps reference these by id. */
export const FRAMEWORK_PHASES = [
  { id: 'understand', index: '01', label: 'Understand', caption: 'Read the situation as it is' },
  { id: 'breakdown', index: '02', label: 'Break Down', caption: 'Split the outcome into parts' },
  { id: 'plan', index: '03', label: 'Plan', caption: 'Order the work realistically' },
  { id: 'act', index: '04', label: 'Act', caption: 'Do the next small thing' },
  { id: 'track', index: '05', label: 'Track', caption: 'Measure, then adjust' },
];

export const PHASE_BY_ID = FRAMEWORK_PHASES.reduce((acc, phase) => {
  acc[phase.id] = phase;
  return acc;
}, {});

/** Tiny step factory so the six plans stay readable. */
function mkStep(phase, id, title, summary, tasks, details = [], resources = []) {
  return { phase, id, title, summary, tasks, details, resources };
}

/* ------------------------------------------------------------
   1. PERSONAL LIFE
   ------------------------------------------------------------ */
const personalLife = {
  id: 'personal-life',
  category: 'PERSONAL LIFE',
  title: 'Personal Life',
  tag: 'Strategy',
  headline: 'Turn a personal intention into a practical plan.',
  description:
    'Tell FlowState what you want to improve. We break your intention into clear, manageable actions you can start today.',
  prompt: 'What would you like to improve?',
  placeholder: 'I want to build a better daily routine...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Build better habits',
    'Improve my daily routine',
    'Manage my time',
    'Reduce distractions',
    'Set a personal goal',
    'Become more organized',
  ],
  questions: [
    {
      id: 'pace',
      label: 'How much can you change at once?',
      type: 'choice',
      default: 'One thing at a time',
      options: ['One thing at a time', 'Two or three things', 'A full reset'],
    },
  ],
  focusAreas: ['Time management', 'Daily planning', 'Consistency', 'Progress tracking'],
  focusRules: [
    [/(routine|morning|evening|daily)/i, 'Routine design'],
    [/(habit|consisten)/i, 'Habit loops'],
    [/(distract|focus|phone|scroll)/i, 'Distraction control'],
    [/(organi|clutter|tidy)/i, 'Environment setup'],
    [/(sleep|rest)/i, 'Rest and recovery'],
  ],
  build: ({ subject, answers }) => {
    const pace = answers.pace || 'One thing at a time';
    const breadth =
      pace === 'A full reset'
        ? 'what your reset actually changes'
        : pace === 'Two or three things'
          ? 'your two or three changes'
          : 'your single change';
    return [
      mkStep(
        'understand',
        'map-routine',
        'Map your current routine',
        'See how your days actually run before you try to change them.',
        [
          'Write down a typical weekday, hour by hour',
          'Mark the three moments you feel most drained',
          'Note what you already protect time for',
        ],
        [
          'Awareness comes first - you cannot redesign a routine you have never looked at.',
          'Keep it to one page. This is a diagnostic, not a diary.',
        ],
        [{ label: 'One page, one weekday', note: 'Use the same weekday for every check-in' }]
      ),
      mkStep(
        'breakdown',
        'find-friction',
        'Find the friction',
        'Name the specific places where the routine breaks, not the general feeling.',
        [
          'Circle the two biggest time sinks on your map',
          'Write what triggers each one',
          'Write what you would rather be doing instead',
        ],
        ['Friction is usually structural - a missing cue, an unclear start time, a phone within reach.']
      ),
      mkStep(
        'plan',
        'set-priorities',
        `Decide on ${breadth}`,
        'Turn the intention into one sentence you can act on this week.',
        [
          `State your goal for "${subject}" in one sentence`,
          'Define what "done" looks like for it',
          'Decide what you will say no to, to protect it',
        ],
        [
          'If you cannot describe what done looks like, the goal is still too vague to plan.',
          'Saying no is part of the plan, not a side effect of it.',
        ]
      ),
      mkStep(
        'plan',
        'build-routine',
        'Build a realistic routine',
        'Design the day around the goal, in the time you actually have.',
        [
          'Pick a fixed time and place for the goal',
          'Attach it to something you already do daily',
          'Keep the first version of the routine deliberately small',
        ],
        ['A routine you can keep for two weeks beats an ideal one you keep for two days.'],
        [{ label: 'Anchor it to an existing habit', note: 'After coffee, after class, after lunch' }]
      ),
      mkStep(
        'act',
        'daily-actions',
        'Create your daily actions',
        'Reduce the routine to actions that take less than 15 minutes each.',
        [
          'Write today\'s single smallest action',
          'Do that action before adding a second one',
          'Log it the moment it is done',
        ],
        ['Small and finished beats ambitious and abandoned.'],
        [{ label: 'Two-minute rule', note: 'If the action takes under two minutes, do it now' }]
      ),
      mkStep(
        'track',
        'track-consistency',
        'Track consistency',
        'Count days you showed up, not hours of effort.',
        [
          'Mark today on a simple streak or checklist',
          'Note what made today easy or hard',
          'Review the week on the same day each week',
        ],
        ['Consistency is the metric. Volume follows consistency, never the other way round.']
      ),
      mkStep(
        'track',
        'reflect-adjust',
        'Reflect and adjust',
        'Keep what worked, redesign what did not, drop what never stood a chance.',
        [
          'Keep one thing that worked',
          'Change one thing that did not',
          'Remove one thing you were pretending to do',
        ],
        ['A routine is a draft you revise weekly, not a contract you sign once.']
      ),
    ];
  },
};

/* ------------------------------------------------------------
   2. PRODUCTIVITY
   ------------------------------------------------------------ */
const productivity = {
  id: 'productivity',
  category: 'PRODUCTIVITY',
  title: 'Productivity',
  tag: 'Action',
  headline: 'Turn a messy intention into structured action.',
  description:
    'Drop in the task, exam or project that is sitting on you. FlowState splits it into parts, orders them, and gives you today\'s actions.',
  prompt: 'What needs to get done?',
  placeholder: 'I need to prepare for my DBMS exam...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Prepare for an exam',
    'Finish a project',
    'Organize my tasks',
    'Plan my week',
    'Stop procrastinating',
    'Break down a large task',
  ],
  questions: [
    {
      id: 'deadline',
      label: 'How much time do you have?',
      type: 'choice',
      default: 'This week',
      options: ['Today', 'This week', 'This month', 'No fixed deadline'],
    },
  ],
  focusAreas: ['Scope clarity', 'Sequencing', 'Time blocking', 'Daily execution', 'Progress tracking'],
  focusRules: [
    [/(exam|test|paper|revision|syllabus)/i, 'Exam scope'],
    [/(project|build|ship|deliver)/i, 'Delivery scope'],
    [/(procrastinat|avoid|stuck)/i, 'Starting friction'],
    [/(week|schedule|calendar)/i, 'Weekly structure'],
  ],
  build: ({ subject, answers }) => {
    const deadline = answers.deadline || 'This week';
    const horizon =
      deadline === 'Today'
        ? 'you have today - treat every step below as a single sitting'
        : deadline === 'No fixed deadline'
          ? 'there is no deadline yet, so the plan has to create one'
          : `the deadline is ${deadline.toLowerCase()}`;
    return [
      mkStep(
        'understand',
        'restate-outcome',
        'Restate the outcome',
        `Write the finish line in one sentence. Right now ${horizon}.`,
        [
          `Describe what finished "${subject}" looks like`,
          'List the deliverable or evidence it exists',
          'Note what is genuinely out of scope',
        ],
        [
          'Most overwhelm is an unclear finish line, not a shortage of time.',
          'Naming what is out of scope is the fastest way to shrink a task.',
        ]
      ),
      mkStep(
        'breakdown',
        'split-parts',
        'Split it into parts',
        'Break the outcome into four to six parts that could each stand alone.',
        [
          'Write every part you can think of, without ordering them',
          'Group duplicates and merge anything smaller than 20 minutes',
          'Stop at six parts - more than six is a second workflow',
        ],
        [
          'Parts should be describable as a noun ("syllabus", "ER model"), not a feeling.',
          'If a part still feels huge, split that part instead of adding a new one.',
        ]
      ),
      mkStep(
        'breakdown',
        'critical-path',
        'Find the critical path',
        'Mark which parts unlock the others, and which are just noise.',
        [
          'Draw the dependency: what must exist before what',
          'Mark the parts only you can do',
          'Park anything that is optional for this deadline',
        ],
        [
          'The critical path is the shortest chain that still reaches the finish line.',
          'Optional work goes last, not first - it feels productive and moves nothing.',
        ]
      ),
      mkStep(
        'plan',
        'schedule-blocks',
        'Schedule the work',
        'Give every part a slot in your calendar before you give it effort.',
        [
          'Estimate each part in blocks of 45 minutes',
          'Place the hardest part in your best hour of the day',
          'Leave one empty block for slippage',
        ],
        ['An unscheduled task is a wish. A scheduled task is a commitment with a door on it.'],
        [{ label: '45-minute blocks', note: 'Two blocks back to back, then a real break' }]
      ),
      mkStep(
        'act',
        'start-first-action',
        "Start with today's actions",
        'Ignore the whole list. Only the next block exists.',
        [
          'Do the first 45-minute block on the hardest part',
          'Mark the part done or note exactly where you stopped',
          'Start the next block from that note',
        ],
        [
          'Starting friction disappears when the first action is concrete and small.',
          'Rereading a half-finished part costs more than continuing it.',
        ]
      ),
      mkStep(
        'act',
        'unblock-hard-parts',
        'Handle what you keep avoiding',
        'Go straight at the part you have skipped twice.',
        [
          'Name the part you keep postponing',
          'Write the smallest version of it you could do in 15 minutes',
          'Do that version now',
        ],
        ['Avoidance is information: the task is either unclear or too large. Shrink it.'],
        [{ label: 'Parkinson\'s law', note: 'Work expands to fill the time you give it' }]
      ),
      mkStep(
        'track',
        'close-the-loop',
        'Close the loop daily',
        'Two minutes at the end of the day keeps the plan honest.',
        [
          'Mark which parts moved today',
          'Move anything that slipped to a real block',
          'Confirm tomorrow\'s first action before you stop',
        ],
        ['The plan changes daily. The finish line does not.']
      ),
    ];
  },
};

/* ------------------------------------------------------------
   3. HEALTH & FITNESS
   ------------------------------------------------------------ */
const healthFitness = {
  id: 'health-fitness',
  category: 'HEALTH & FITNESS',
  title: 'Health & Fitness',
  tag: 'Balance',
  headline: 'Build a routine you can actually keep.',
  description:
    'FlowState helps you organise general wellness habits - sleep, movement, screen time - into a modest, repeatable routine.',
  prompt: 'What would you like to improve?',
  placeholder: 'I want to improve my sleep routine...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Improve my sleep routine',
    'Become more physically active',
    'Build a consistent exercise routine',
    'Organize my daily wellness habits',
    'Reduce excessive screen time',
  ],
  notice:
    'General wellness planning only. This is not medical advice, and FlowState does not diagnose, treat or prescribe. Talk to a qualified professional about anything medical.',
  questions: [
    {
      id: 'area',
      label: 'Where do you want to start?',
      type: 'choice',
      default: 'Sleep and recovery',
      options: ['Sleep and recovery', 'Movement and energy', 'Screen time and rest', 'Daily structure'],
    },
  ],
  focusAreas: ['One change at a time', 'Realistic targets', 'Daily consistency', 'Gentle review'],
  focusRules: [
    [/(sleep|rest|insomnia|tired)/i, 'Sleep quality'],
    [/(exercise|gym|active|walk|run|strength)/i, 'Movement'],
    [/(screen|phone|scroll|doom)/i, 'Screen time'],
    [/(eat|diet|food|water|hydrat)/i, 'Everyday nutrition'],
    [/(stress|calm|breath|medit)/i, 'Stress management'],
  ],
  build: ({ subject, answers }) => {
    const area = answers.area || 'Sleep and recovery';
    return [
      mkStep(
        'understand',
        'baseline-week',
        'Note your current baseline',
        `See what a normal week looks like for ${subject.toLowerCase()}, without judging it.`,
        [
          'Write down your usual patterns for one week',
          'Note the two moments that feel worst',
          'Note what is already working',
        ],
        [
          'A baseline is a measurement, not a verdict.',
          'Starting from what already works is easier than starting from zero.',
        ]
      ),
      mkStep(
        'breakdown',
        'pick-one-area',
        'Pick one or two areas',
        'Change one thing at a time - the body notices cumulative change, not dramatic change.',
        [
          `Choose one habit inside ${area.toLowerCase()} to adjust first`,
          'Write the smallest version of that habit',
          'Decide what you are deliberately not changing yet',
        ],
        ['Deliberately leaving things alone is what makes the one change survivable.']
      ),
      mkStep(
        'plan',
        'set-target',
        'Set a target you can hold',
        'Choose a target that works on a bad day, not only on a good one.',
        [
          'Set a minimum version and an ideal version',
          'Attach the habit to a fixed time of day',
          'Decide what counts as a missed day',
        ],
        [
          'Your minimum is the real target. The ideal version is a bonus.',
          'Two missed days in a row is the signal to shrink the habit, not to try harder.',
        ]
      ),
      mkStep(
        'act',
        'daily-actions',
        'Create simple daily actions',
        'Keep every action under 20 minutes and inside your normal day.',
        [
          'Write today\'s action in one line',
          'Do it at the anchored time, not when you remember',
          'Stop at the planned amount, even if you feel like more',
        ],
        ['Stopping early keeps the habit repeatable, which is the whole point.'],
        [{ label: 'Consistency over intensity', note: 'Frequency first, difficulty later' }]
      ),
      mkStep(
        'track',
        'track-consistency',
        'Track consistency',
        'Count the days you showed up, and how the habit felt.',
        [
          'Mark today on a simple checklist',
          'Rate how the action felt (easy / okay / hard)',
          'Review the week every seventh day',
        ],
        ['The rating matters more than the tick - it tells you when to adjust.']
      ),
      mkStep(
        'track',
        'review-adjust',
        'Review and adjust',
        'Adjust the plan to the life you have, not the one you wish you had.',
        [
          'Keep the parts that felt easy',
          'Shrink anything rated hard twice in a row',
          'Plan next week around your busiest day',
        ],
        ['If a routine needs perfect conditions, it is not yet a routine.']
      ),
    ];
  },
};

/* ------------------------------------------------------------
   4. CAREER / GROWTH
   ------------------------------------------------------------ */
const careerGrowth = {
  id: 'career-growth',
  category: 'CAREER / GROWTH',
  title: 'Career Growth',
  tag: 'Vision',
  headline: 'Turn a career goal into a development roadmap.',
  description:
    'FlowState maps your current skills against where you want to be, then sequences learning, projects and preparation in one roadmap.',
  prompt: 'What do you want to grow into?',
  placeholder: 'I want to become a software developer...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Become a software developer',
    'Learn AI / ML',
    'Prepare for internships',
    'Build my portfolio',
    'Improve my technical skills',
    'Prepare for interviews',
  ],
  questions: [
    {
      id: 'level',
      label: 'Current level',
      type: 'choice',
      default: 'Beginner',
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      id: 'goal',
      label: 'Where is this heading?',
      type: 'choice',
      default: 'Skill development',
      options: ['Internship', 'Job', 'Project', 'Skill development'],
    },
  ],
  focusAreas: ['Skill audit', 'Gap analysis', 'Learning sequence', 'Proof of work', 'Interview readiness'],
  focusRules: [
    [/(ai|ml|machine learning|data)/i, 'Applied AI fundamentals'],
    [/(interview|dsa|algorithm)/i, 'Interview preparation'],
    [/(portfolio|resume|cv)/i, 'Portfolio and presentation'],
    [/(frontend|react|web|javascript)/i, 'Frontend depth'],
    [/(backend|api|server|database)/i, 'Backend depth'],
  ],
  build: ({ subject, answers }) => {
    const level = answers.level || 'Beginner';
    const goal = answers.goal || 'Skill development';
    const goalCopy =
      goal === 'Internship'
        ? 'an internship-ready profile'
        : goal === 'Job'
          ? 'a job-ready profile'
          : goal === 'Project'
            ? 'a shipped project you can show'
            : 'demonstrable skill';
    const pace =
      level === 'Beginner'
        ? 'Start with fundamentals and one small build; do not chase breadth yet.'
        : level === 'Intermediate'
          ? 'Skip the basics you can already explain out loud and go straight to depth plus a substantial build.'
          : 'Go straight to depth, architecture and teaching your work back to others.';
    return [
      mkStep(
        'understand',
        'skills-audit',
        'Audit your current skills',
        `Write down what you can already do unaided. The gap only makes sense against that list.`,
        [
          `${subject} - list what you can explain without notes`,
          'List what you have built, however small',
          'Mark which skills you have only read about',
        ],
        ['"Can explain it out loud" is the honest test of knowing something.', pace]
      ),
      mkStep(
        'breakdown',
        'skill-gap',
        'Map the skill gap',
        `Place your list next to what ${goalCopy} actually requires.`,
        [
          `Find three skills that ${goalCopy} needs and you lack`,
          'Separate must-haves from nice-to-haves',
          'Pick the two gaps that block everything else',
        ],
        [
          'Most roadmaps fail from too many parallel tracks, not from choosing the wrong one.',
          'The blocking gaps come first - usually fundamentals, tooling or communication.',
        ]
      ),
      mkStep(
        'plan',
        'learning-roadmap',
        'Sequence a learning roadmap',
        'Order the work so each step makes the next one easier.',
        [
          'Order your gaps into four to six stages',
          'Give each stage one concrete outcome',
          'Set the order so each stage produces something usable',
        ],
        ['Stages should be outcome-shaped ("build a CRUD app"), not topic-shaped ("read about REST").'],
        [{ label: 'One stage at a time', note: 'Depth in one track beats shallow coverage of five' }]
      ),
      mkStep(
        'plan',
        'proof-of-work',
        'Choose proof-of-work projects',
        'Decide what you will build so the learning leaves evidence behind.',
        [
          'Choose one practice project per stage',
          'Choose one flagship project that ties the stages together',
          'Write what each project should demonstrate to a stranger',
        ],
        [
          'Projects are how skill becomes visible to anyone reading your resume.',
          'Small and finished outperforms ambitious and unfinished, every time.',
        ]
      ),
      mkStep(
        'act',
        'ship-and-publish',
        'Ship and publish',
        'Put the work where people can find it, however imperfect.',
        [
          'Publish the flagship project to a public repo with a real README',
          'Write three lines on what you built, for each project',
          'Ask one person for specific feedback',
        ],
        ['A published imperfect project counts. A private perfect one does not.']
      ),
      mkStep(
        'track',
        'interview-prep',
        'Prepare and review',
        'Convert the roadmap into conversations: practice, feedback, repeat.',
        [
          'Run one mock interview or code review this week',
          'Update your resume with the newest stage',
          'Review the roadmap monthly and re-rank the gaps',
        ],
        [
          `Keep every artefact pointed at ${goalCopy}.`,
          'Re-rank gaps monthly - the list you wrote on day one is a starting hypothesis.',
        ],
        [{ label: 'Feedback loop', note: 'One conversation beats ten more hours of tutorials' }]
      ),
    ];
  },
};

/* ------------------------------------------------------------
   5. FINANCIAL FREEDOM
   ------------------------------------------------------------ */
const financialFreedom = {
  id: 'financial-freedom',
  category: 'FINANCIAL FREEDOM',
  title: 'Financial Freedom',
  tag: 'Security',
  headline: 'Turn a money goal into a visible plan.',
  description:
    'FlowState helps you organise a savings goal, see an illustrative timeline, and build the habits that keep it on track.',
  prompt: 'What are you saving or planning for?',
  placeholder: 'I want to save for a laptop...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Track my spending',
    'Plan a savings goal',
    'Save for a purchase',
    'Organize monthly expenses',
    'Learn basic investing concepts',
    'Build better financial habits',
  ],
  notice:
    'Educational planning only. This is not financial advice, and FlowState does not recommend specific products, funds or investments.',
  questions: [
    { id: 'current', label: 'Current savings', type: 'number', default: 10000, min: 0, max: 10000000, step: 1000, prefix: '₹' },
    { id: 'target', label: 'Amount you are aiming for', type: 'number', default: 60000, min: 1000, max: 100000000, step: 1000, prefix: '₹' },
    { id: 'monthly', label: 'Amount you can set aside each month', type: 'number', default: 5000, min: 500, max: 1000000, step: 500, prefix: '₹' },
  ],
  /** Tells the timeline to render the illustrative savings projection. */
  planner: 'savings',
  focusAreas: ['Visibility of spending', 'A single goal', 'A monthly amount', 'Consistency', 'Periodic review'],
  focusRules: [
    [/(spend|expense|budget)/i, 'Spending visibility'],
    [/(save|saving|goal|purchase|laptop)/i, 'Goal-based saving'],
    [/(invest|market|mutual fund|stock)/i, 'Basic investing literacy'],
    [/(debt|loan|emi)/i, 'Debt awareness'],
    [/(income|salary|side)/i, 'Income tracking'],
  ],
  build: ({ subject, answers }) => {
    const current = Number(answers.current) || 0;
    const target = Number(answers.target) || 0;
    const monthly = Number(answers.monthly) || 0;
    const gap = Math.max(target - current, 0);
    const months = monthly > 0 ? Math.ceil(gap / monthly) : 0;
    const horizon = months > 0 ? `around ${months} month${months === 1 ? '' : 's'} at the current pace` : 'a pace you still need to set';
    return [
      mkStep(
        'understand',
        'see-the-numbers',
        'See where you are',
        `${subject} costs ${target.toLocaleString('en-IN')} and you are starting from ${current.toLocaleString('en-IN')} - ${horizon}.`,
        [
          'Write down the goal amount and today\'s savings',
          'List your recurring monthly costs from the last statement',
          'Note the months where spending usually spikes',
        ],
        [
          'A number you have looked at directly is easier to plan around than one you avoid.',
          'The spikes matter more than the average - plan for the expensive months too.',
        ]
      ),
      mkStep(
        'breakdown',
        'split-the-gap',
        'Split the gap into months',
        'Break the distance between now and the goal into monthly amounts you can actually set aside.',
        [
          `Divide the remaining ${gap.toLocaleString('en-IN')} by your monthly amount`,
          'Mark the months where you cannot save the full amount',
          'Pick one month to be your catch-up month',
        ],
        ['Missing a month is normal. Having a named catch-up month is what keeps the plan alive.'],
        [{ label: 'Illustrative timeline', note: 'Estimates only - your real pace will vary' }]
      ),
      mkStep(
        'plan',
        'one-goal-first',
        'Set one goal first',
        'One goal at a time keeps the plan visible and the motivation honest.',
        [
          `Keep "${subject}" as the only named goal for now`,
          'Decide the exact figure you are saving toward',
          'Write what you will postpone until this goal is done',
        ],
        ['Juggling several goals quietly turns every one of them into a vague intention.']
      ),
      mkStep(
        'plan',
        'build-the-habit',
        'Build the monthly habit',
        'Automate the decision, not just the transfer.',
        [
          'Pick the day of the month you set money aside',
          'Decide the amount for minimum and good months',
          'Write how you will log it afterwards',
        ],
        ['The habit is a date plus an amount. Without a date, it stays an intention.']
      ),
      mkStep(
        'act',
        'cut-one-leak',
        'Close one leak',
        'Find a single recurring cost that is not buying you anything.',
        [
          'Pick one subscription or habit to pause this month',
          'Move that amount to the goal instead',
          'Note what you would gain if you kept it and something else went instead',
        ],
        ['One closed leak is worth more than a strict month you abandon in week two.']
      ),
      mkStep(
        'track',
        'review-monthly',
        'Review monthly',
        'Compare the projection with what really happened, then adjust the pace.',
        [
          'Log the month: saved, spent, unplanned',
          'Recalculate the remaining months',
          'Adjust the monthly amount rather than abandoning the goal',
        ],
        [
          'The projection is a planning tool, not a scorecard.',
          'Slow and honest beats fast and imaginary.',
        ],
        [{ label: 'Learning, not advice', note: 'Look up concepts, not products' }]
      ),
    ];
  },
};

/* ------------------------------------------------------------
   6. AI TUTOR / STUDY
   ------------------------------------------------------------ */
const aiTutor = {
  id: 'ai-tutor',
  category: 'AI TUTOR / STUDY',
  title: 'AI Tutor / Study',
  tag: 'Learn',
  headline: 'Turn "I want to learn this" into a study roadmap.',
  description:
    'FlowState builds a learning roadmap for your subject, sized to the time you really have each day. Pair it with the AI Tutor when you get stuck.',
  prompt: 'What do you want to learn?',
  placeholder: 'I want to learn Machine Learning...',
  cta: 'Start Workflow',
  suggestedIntents: [
    'Learn React',
    'Learn Python',
    'Learn Machine Learning',
    'Learn Java',
    'Prepare for an exam',
    'Learn web development',
  ],
  questions: [
    {
      id: 'level',
      label: 'Current level',
      type: 'choice',
      default: 'Beginner',
      options: ['Beginner', 'Intermediate', 'Advanced'],
    },
    {
      id: 'time',
      label: 'Available time',
      type: 'choice',
      default: '1 hour/day',
      options: ['30 min/day', '1 hour/day', '2 hours/day', '3+ hours/day'],
    },
    {
      id: 'goal',
      label: 'Goal',
      type: 'choice',
      default: 'Project',
      options: ['College', 'Exam', 'Project', 'Internship', 'Career'],
    },
  ],
  focusAreas: ['Fundamentals first', 'Deliberate practice', 'Building things', 'Spaced review', 'Explaining out loud'],
  focusRules: [
    [/(react|frontend|web|javascript|html|css)/i, 'Frontend practice'],
    [/(python|java|c\+\+|code)/i, 'Programming fluency'],
    [/(machine learning|ml|ai|deep learning|neural)/i, 'Applied mathematics'],
    [/(exam|syllabus|semester|college)/i, 'Exam coverage'],
    [/(data|sql|database)/i, 'Data handling'],
  ],
  build: ({ subject, answers }) => {
    const level = answers.level || 'Beginner';
    const time = answers.time || '1 hour/day';
    const goal = answers.goal || 'Project';
    const perDay = time.startsWith('30') ? 1 : time.startsWith('1') ? 2 : time.startsWith('2') ? 3 : 4;
    const plan = [
      ['Orientation', `What ${subject} is actually used for, and what a good result looks like.`, ['Watch one overview of ${subject}, take notes', 'Write three questions you want answered', 'Skim a real example project']],
      ['Fundamentals', `The vocabulary and core ideas everything later depends on.`, ['Work through the core concepts one by one', 'Explain each concept out loud without notes', 'Write down the two you still cannot explain']],
      ['Language and tools', `The everyday tooling: editor, packages, command line, debugging.`, ['Set up the standard toolchain for ${subject}', 'Rebuild one small example from scratch', 'Fix one deliberate error and note the cause']],
      ['Core mechanics', `How the main pieces behave and connect, worked by hand.`, ['Work 5 short exercises by hand', 'Rewrite one exercise from memory', 'Note every place you needed a reference']],
      ['Applied practice', `Use the concepts on problems you have not seen before.`, ['Solve one problem without a tutorial', 'Compare it with a reference solution', 'Write the difference in your own words']],
      ['Build a small project', `Turn ${subject} concepts into something runnable and visible.`, ['Build the smallest version that works', 'Commit it and write a short README', 'Break it on purpose, then repair it']],
      ['Deepen and connect', `Go past the tutorial: edge cases, performance, structure.`, ['Improve one part of your project', 'Read one high-quality reference on it', 'Write what surprised you']],
      ['Teach it back', `Explain it to someone else - the real test of understanding.`, ['Explain ${subject} in five minutes, out loud', 'Answer the next three questions you get asked', 'Update your notes with what you fumbled']],
    ];
    const roadmap = plan.slice(0, Math.min(plan.length, perDay === 1 ? 5 : perDay === 2 ? 7 : plan.length));
    const finalNote =
      goal === 'Exam'
        ? 'Then shift to timed past papers - exams reward retrieval, not rereading.'
        : goal === 'Internship' || goal === 'Career'
          ? 'Then gear the project toward something you could discuss in an interview.'
          : goal === 'College'
            ? 'Then map each topic back to your syllabus and mark coverage.'
            : 'Then keep shipping small projects - building is what consolidates it.';
    return roadmap.map(([title, summary, tasks], index) => {
      const isLast = index === roadmap.length - 1;
      return mkStep(
        phaseForRoadmap(index, roadmap.length),
        `roadmap-${index + 1}`,
        `${String(index + 1).padStart(2, '0')} ${title}`,
        summary,
        tasks.map((task) => task.replaceAll('${subject}', subject)),
        level === 'Beginner'
          ? [`Budget ${time}. Short daily sessions beat weekend marathons.`]
          : level === 'Intermediate'
            ? [`Budget ${time}. Skip the parts you can already explain out loud.`]
            : [`Budget ${time}. Spend the time on edge cases and structure, not setup.`],
        isLast ? [{ label: 'Next', note: finalNote }] : []
      );
    });
  },
};

/** Map a roadmap position onto the five FlowState phases, whatever its length. */
function phaseForRoadmap(index, total) {
  if (index === total - 1) return 'track';
  const ratio = total <= 1 ? 0 : index / (total - 1);
  if (ratio < 0.25) return 'understand';
  if (ratio < 0.5) return 'breakdown';
  if (ratio < 0.75) return 'plan';
  return 'act';
}

/* ------------------------------------------------------------
   Registry - Gallery cards resolve their workflow by id.
   ------------------------------------------------------------ */
export const WORKFLOWS = {
  [personalLife.id]: personalLife,
  [productivity.id]: productivity,
  [healthFitness.id]: healthFitness,
  [careerGrowth.id]: careerGrowth,
  [financialFreedom.id]: financialFreedom,
  [aiTutor.id]: aiTutor,
};

export const WORKFLOW_LIST = Object.values(WORKFLOWS);

export function getWorkflow(id) {
  return WORKFLOWS[id] || null;
}

/** Focus areas for a category, extended by any keyword rule that matches. */
export function inferFocusAreas(workflow, intent) {
  if (!workflow) return [];
  const matched = (workflow.focusRules || [])
    .filter(([pattern]) => pattern.test(intent || ''))
    .map(([, label]) => label);
  const base = (workflow.focusAreas || []).slice(0, 4);
  return Array.from(new Set([...base, ...matched])).slice(0, 6);
}
