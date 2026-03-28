import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './BentoGrid.css';

const BentoGrid = () => {
  const [lifeOutcomes] = useState(() => {
    const savedData = localStorage.getItem('flowstate_life_outcomes');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing life outcomes data", e);
        return null;
      }
    }
    return null;
  });

  const cards = [
    {
      title: "Tailored next action ranking",
      description: "Our AI prioritizes your tasks based on your current state and long-term goals.",
      category: "next-action",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      size: "card-standard",
      link: "Start",
      path: "#"
    },
    {
      title: "Intent-based smart guidance",
      description: "AI-driven nudges to keep you in flow and avoid distractions before they happen.",
      category: "smart-guidance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
      ),
      size: "card-wide",
      link: "Learn more",
      path: "/smart-guidance"
    },
    {
      title: "Life outcomes",
      description: lifeOutcomes 
        ? `Based on your goal to "${lifeOutcomes.goal}": in 30 days, ${lifeOutcomes.impact.oneMonth} By 90 days, ${lifeOutcomes.impact.threeMonths}`
        : "Simulate how your current habits will impact your future health and career.",
      category: "life-outcomes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.43Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.43Z"/>
        </svg>
      ),
      size: "card-standard",
      path: "#"
    },
    {
      title: "Secure data privacy",
      description: "Your data is encrypted and never shared. You own your flow.",
      category: "data-privacy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        </svg>
      ),
      size: "card-wide",
      link: "Learn how",
      path: "/privacy"
    },
    {
      title: "Priority insights",
      description: "Deep analytics on where your time goes and how to optimize it.",
      category: "priority-insights",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      size: "card-standard",
      link: "View insights",
      path: "/priority-insights"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
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
          viewport={{ once: true, margin: "-100px" }}
        >
          {cards.map((card, index) => (
            <motion.div 
              key={index}
              className={`bento-card ${card.size} ${card.category}`}
              variants={itemVariants}
            >
              <div className="bento-inner">
                <div className="bento-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                {card.path.startsWith('/') ? (
                  <Link to={card.path} className="card-link">
                    {card.link}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </Link>
                ) : (
                  <a href={card.path} className="card-link">
                    {card.link}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGrid;
