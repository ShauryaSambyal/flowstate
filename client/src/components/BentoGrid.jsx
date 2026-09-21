import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRoadmapHistory } from '../hooks/useRoadmapHistory.js';
import { formatRoadmapDate } from '../history/roadmapHistory.js';
import './BentoGrid.css';

/* Four equal cards. The old "Tailored next action ranking" card is gone, and
   the Life outcomes card now shows this account's real roadmap history. */
const BentoGrid = () => {
  const { roadmaps, isGuest, loading } = useRoadmapHistory();
  const latest = roadmaps.slice(0, 3);

  const cards = [
    {
      title: 'Intent-based smart guidance',
      description:
        'AI-driven nudges to keep you in flow and avoid distractions before they happen.',
      category: 'smart-guidance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
      ),
      link: 'Learn more',
      path: '/smart-guidance',
    },
    {
      title: 'Roadmap history',
      category: 'life-outcomes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3.5 2"/>
        </svg>
      ),
      body: (
        <div className="card-history">
          {loading && <p className="card-description card-history-empty">Reading your history…</p>}

          {!loading && roadmaps.length === 0 && (
            <p className="card-description card-history-empty">
              Every roadmap you generate is kept here, newest first. None yet —
              {isGuest ? ' generate one and it will be stored on this device.' : ' start with a goal.'}
            </p>
          )}

          {!loading && latest.length > 0 && (
            <>
              <ul className="card-history-list">
                {latest.map((item) => (
                  <li key={item.id} className="card-history-item">
                    <span className="card-history-goal">{item.goal}</span>
                    <span className="card-history-meta">
                      {formatRoadmapDate(item.createdAt)}
                      {item.runs > 1 ? ` · ${item.runs}×` : ''}
                    </span>
                  </li>
                ))}
              </ul>
              {roadmaps.length > latest.length && (
                <p className="card-history-meta">+{roadmaps.length - latest.length} earlier</p>
              )}
            </>
          )}
        </div>
      ),
      link: roadmaps.length > 0 ? `View all ${roadmaps.length}` : 'Open history',
      path: '/history',
    },
    {
      title: 'Secure data privacy',
      description: 'Your data is encrypted and never shared. You own your flow.',
      category: 'data-privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        </svg>
      ),
      link: 'Learn how',
      path: '/privacy',
    },
    {
      title: 'Priority insights',
      description: 'Deep analytics on where your time goes and how to optimize it.',
      category: 'priority-insights',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      link: 'View insights',
      path: '/priority-insights',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="bento" id="solutions">
      <div className="container">
        <motion.div
          className="bento-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="bento-tag">How it works</span>
          <h2 className="bento-title">Everything you need to master your flow.</h2>
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {cards.map((card) => (
            <motion.div key={card.title} className={`bento-card ${card.category}`} variants={itemVariants}>
              <div className="bento-inner">
                <div className="bento-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                {card.body || <p className="card-description">{card.description}</p>}
                <Link to={card.path} className="card-link">
                  {card.link}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGrid;
