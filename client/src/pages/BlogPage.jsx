import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './SmartGuidance.css';
import './BlogPage.css';

/* Short, useful field notes for people using FlowState — how to write an
   intention, how to practise, how to use an AI tutor honestly — plus a curated
   set of places to actually learn and practise. */

const RESOURCE_GROUPS = [
  {
    label: 'Practice and problem solving',
    items: [
      { name: 'LeetCode', url: 'https://leetcode.com', note: 'Interview-style problems, strong for DSA reps' },
      { name: 'Codewars', url: 'https://www.codewars.com', note: 'Short katas, ranked by difficulty' },
      { name: 'Exercism', url: 'https://exercism.org', note: 'Free tracks with human-written feedback' },
      { name: 'HackerRank', url: 'https://www.hackerrank.com', note: 'Structured practice in many languages' },
      { name: 'Project Euler', url: 'https://projecteuler.net', note: 'Maths-heavy problems for the curious' },
    ],
  },
  {
    label: 'AI assistants that help you think',
    items: [
      { name: 'Claude', url: 'https://claude.ai', note: 'Long-form explanation and code review' },
      { name: 'Gemini', url: 'https://gemini.google.com', note: 'Multimodal questions, images and docs' },
      { name: 'ChatGPT', url: 'https://chatgpt.com', note: 'General-purpose drafting and debugging' },
      { name: 'Google AI Studio', url: 'https://aistudio.google.com', note: 'Experiment with models and prompts' },
      { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', note: 'In-editor completion and tests' },
    ],
  },
  {
    label: 'Learn the fundamentals',
    items: [
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', note: 'Full curriculum, free, project-based' },
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', note: 'The reference for the web platform' },
      { name: 'CS50', url: 'https://cs50.harvard.edu/x/', note: 'Harvard intro to computer science' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com', note: 'Open-source full-stack path' },
      { name: 'roadmap.sh', url: 'https://roadmap.sh', note: 'Concept maps for almost any track' },
    ],
  },
  {
    label: 'Data, ML and reading',
    items: [
      { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', note: 'Short applied ML and data courses' },
      { name: 'fast.ai', url: 'https://course.fast.ai', note: 'Practical deep learning, top-down' },
      { name: 'Papers with Code', url: 'https://paperswithcode.com', note: 'Research plus runnable implementations' },
      { name: 'Anki', url: 'https://apps.ankiweb.net', note: 'Spaced repetition for exam material' },
    ],
  },
];

const POSTS = [
  {
    slug: 'intent-is-the-interface',
    tag: 'Product',
    date: '12 Mar 2026',
    read: '4 min',
    title: 'Intent is the interface',
    lede:
      'Most productivity tools ask you to fill in a form. FlowState asks you one question and does the structuring for you.',
    body: [
      'A form makes you do the thinking up front: category, priority, due date, estimate. That is exactly the work you were stuck on — which is why half-finished task lists exist. FlowState takes the opposite route. You write the intention the way you would say it out loud, and the structure comes after.',
      'A useful intention has three parts: what you want (the outcome), what it is for (the reason), and what is in the way (the constraint). "Prepare for my DBMS exam in ten days, and I keep losing evenings to my phone" gives the planner far more to work with than "study more".',
      'Everything downstream — the roadmap, the workflow, the actions you tick off — is derived from that sentence. If the plan feels wrong, the sentence is usually the thing to fix first.',
    ],
    links: [
      { label: 'Try it on Smart Guidance', href: '/smart-guidance', internal: true },
    ],
  },
  {
    slug: 'break-it-down-before-you-schedule-it',
    tag: 'Method',
    date: '18 Mar 2026',
    read: '5 min',
    title: 'Break it down before you schedule it',
    lede:
      'The order is understand, break down, plan, act, track. Swapping the middle two is the most common reason a plan collapses.',
    body: [
      'Scheduling before breaking down produces optimistic blocks that assume nothing will go wrong. Breaking down first tells you what the work actually is, how many parts there are, and which parts depend on others. Only then does a calendar make sense.',
      'A practical test: if a part cannot be described as a noun — "syllabus", "ER model", "first draft" — it is still a feeling, not a task. Split it again. Stop at six parts; more than six is really two workflows.',
      'The critical path is the shortest chain that still reaches the finish line. Everything else is optional for this deadline, and optional work goes last, no matter how appealing it feels.',
    ],
    links: [
      { label: 'See the framework in the Workflow Gallery', href: '/#gallery', internal: true },
    ],
  },
  {
    slug: 'practice-beats-tutorial-hours',
    tag: 'Learning',
    date: '24 Mar 2026',
    read: '5 min',
    title: 'Practice beats tutorial hours',
    lede:
      'Watching someone solve a problem feels like learning. Retrieving the solution yourself is learning.',
    body: [
      'Tutorials are efficient at one thing: making a topic feel familiar. Familiarity is not recall, and exams and interviews test recall under time pressure. The gap is closed by attempting problems before you feel ready, then comparing your attempt with a reference.',
      'A balanced week for a new skill: one session reading, two sessions solving, one session building, one session explaining the topic out loud without notes. The explanation session exposes exactly what you only half know.',
      'This is why the AI Tutor workflow asks for a level, a daily time budget and a goal before it builds anything: a roadmap sized to thirty minutes a day looks nothing like one sized to three hours.',
    ],
    links: [
      { label: 'LeetCode', href: 'https://leetcode.com' },
      { label: 'Codewars', href: 'https://www.codewars.com' },
      { label: 'Exercism', href: 'https://exercism.org' },
    ],
  },
  {
    slug: 'ai-tutor-without-outsourcing-the-thinking',
    tag: 'AI',
    date: '2 Apr 2026',
    read: '6 min',
    title: 'Using an AI tutor without outsourcing the thinking',
    lede:
      'An AI assistant is at its best when it checks your reasoning, not when it replaces it.',
    body: [
      'The habit that ruins AI-assisted learning is asking for the answer first. Once you have read a solution, the problem stops being a problem and becomes a memory test. Ask for a hint, a counter-example, or a review of your attempt — then close the tab and try again.',
      'Prompts that work: "Here is my attempt. Where is the flaw in my reasoning?", "Give me one hint, not the solution", "Explain this concept back to me in five sentences and then quiz me", "What is a common mistake people make with this?".',
      'Then verify. Ask for one concrete example you can check by hand — a calculation, a small piece of code, a date. If the example does not hold up, the explanation probably does not either.',
      'Keep the assistant on the side of the work you find boring but necessary: generating practice questions, marking your own summary, turning notes into a quiz. That preserves the thinking where the thinking is the point.',
    ],
    links: [
      { label: 'Claude', href: 'https://claude.ai' },
      { label: 'Gemini', href: 'https://gemini.google.com' },
      { label: 'Google AI Studio', href: 'https://aistudio.google.com' },
    ],
  },
  {
    slug: 'consistency-is-the-metric',
    tag: 'Habits',
    date: '9 Apr 2026',
    read: '4 min',
    title: 'Consistency is the metric',
    lede:
      'Count the days you showed up and how the session felt. Volume follows consistency, never the other way round.',
    body: [
      'A plan you can keep on a bad day beats an ideal plan you abandon in week two. So every habit needs a minimum version small enough to survive a bad day, and an ideal version for the days that go well.',
      'Track two things: whether you showed up, and whether the session felt easy, okay or hard. The rating matters more than the tick — two "hard" sessions in a row is the signal to shrink the habit, not to try harder.',
      'Your workflow progress in FlowState is the same idea at a larger scale: a fraction you can actually move today, not a percentage you feel guilty about.',
    ],
    links: [
      { label: 'Open your history', href: '/history', internal: true },
    ],
  },
  {
    slug: 'money-goals-are-visibility-goals',
    tag: 'Finance',
    date: '16 Apr 2026',
    read: '4 min',
    title: 'Money goals are visibility goals',
    lede:
      'You do not need a better strategy before you have looked at the numbers once. Educational planning only — not financial advice.',
    body: [
      'Start with one goal and one figure. Saving for a laptop is a clearer target than "spend less", because it has a number attached and a moment when it is done.',
      'Then make the pace visible: goal amount, what you have already, and what you can set aside each month. That arithmetic — nothing more — turns a vague worry into a date. Six months or sixteen, you now know.',
      'The habit is a date plus an amount, not a resolution. Pick the day, decide a minimum for bad months and a target for good ones, review once a month and adjust the pace instead of abandoning the goal.',
      'FlowState keeps this to planning: no product recommendations, no promises, no forecasts pretending to be guarantees.',
    ],
    links: [
      { label: 'Build a savings workflow', href: '/#gallery', internal: true },
    ],
  },
];

const linkProps = (item) =>
  item.internal
    ? {}
    : { target: '_blank', rel: 'noopener noreferrer' };

const BlogPage = () => {
  const [openSlug, setOpenSlug] = useState(POSTS[0].slug);

  return (
    <div className="smart-guidance-page blog-page">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Flow
      </Link>

      <div className="content-container">
        <motion.div
          className="header-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="page-tag">Field notes</span>
          <h1 className="page-title">The FlowState journal</h1>
          <p className="page-subtitle">
            Short, practical writing on intent, planning and learning — plus the sites worth your
            practice hours.
          </p>
        </motion.div>

        <section className="blog-list" aria-label="Articles">
          {POSTS.map((post) => {
            const open = openSlug === post.slug;
            return (
              <motion.article
                key={post.slug}
                className={`blog-post${open ? ' is-open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
              >
                <button
                  type="button"
                  className="blog-post-head"
                  aria-expanded={open}
                  onClick={() => setOpenSlug(open ? null : post.slug)}
                >
                  <span className="blog-post-meta mono-label">
                    {post.tag} · {post.date} · {post.read} read
                  </span>
                  <span className="blog-post-title">{post.title}</span>
                  <span className="blog-post-lede">{post.lede}</span>
                  <span className="blog-post-toggle">{open ? 'Close' : 'Read'}</span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="blog-post-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {post.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      {post.links?.length > 0 && (
                        <div className="blog-post-links">
                          {post.links.map((link) =>
                            link.internal ? (
                              <Link key={link.href} to={link.href} className="blog-link">
                                {link.label} →
                              </Link>
                            ) : (
                              <a key={link.href} href={link.href} className="blog-link" {...linkProps(link)}>
                                {link.label} ↗
                              </a>
                            )
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </section>

        <section className="blog-resources" aria-label="Educational resources">
          <h2 className="blog-resources-title">Where to put the work in</h2>
          <p className="blog-resources-note">
            Free, well-established places to practise, learn and check your thinking. All links open
            in a new tab.
          </p>

          <div className="blog-resource-grid">
            {RESOURCE_GROUPS.map((group) => (
              <div key={group.label} className="blog-resource-group">
                <h3 className="blog-resource-label">{group.label}</h3>
                <ul className="blog-resource-list">
                  {group.items.map((item) => (
                    <li key={item.url}>
                      <a
                        className="blog-resource"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="blog-resource-name">
                          {item.name}
                          <span aria-hidden="true"> ↗</span>
                        </span>
                        <span className="blog-resource-note">{item.note}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPage;
