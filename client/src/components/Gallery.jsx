import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkflowModal from './workflow/WorkflowModal.jsx';
import './Gallery.css';

/* The gallery is the entry point into the workflow experience: each card
   opens the FlowState workflow for its category, in place — no navigation. */
const Gallery = () => {
  const items = [
    {
      workflowId: 'personal-life',
      title: 'Personal Life',
      tag: 'Strategy',
      image: '/Empty_chair_in_202603272305.jpeg',
    },
    {
      workflowId: 'productivity',
      title: 'Productivity',
      tag: 'Action',
      image: '/Deadlines_in_phone_202603272312.jpeg',
    },
    {
      workflowId: 'health-fitness',
      title: 'Health & Fitness',
      tag: 'Balance',
      image: '/Guided_action_feed_202603272321.jpeg',
    },
    {
      workflowId: 'career-growth',
      title: 'Career Growth',
      tag: 'Vision',
      image: '/Career_growth_realistic_202603280954.jpeg',
    },
    {
      workflowId: 'financial-freedom',
      title: 'Financial Freedom',
      tag: 'Security',
      image: '/Financial_freedom_comedic_202603280956.jpeg',
    },
    {
      workflowId: 'ai-tutor',
      title: 'AI Tutor / Study',
      tag: 'Learn',
      image: '/download.png',
    },
  ];

  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <motion.h2 
            className="gallery-title"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Workflow Gallery
          </motion.h2>
          <motion.p 
            className="gallery-description"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ color: 'var(--text-inverse-secondary)', maxWidth: '600px', margin: '0 auto' }}
          >
            Open any card to turn an intention into a workflow: FlowState understands what you want,
            breaks it down, plans it, and tracks what you complete.
          </motion.p>
        </div>

        <div className="gallery-grid">
          {items.map((item, index) => (
            <motion.button
              type="button"
              key={item.workflowId}
              className="gallery-item"
              onClick={() => setActiveWorkflowId(item.workflowId)}
              aria-label={`Open the ${item.title} workflow`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img src={item.image} alt="" className="gallery-item-image" />
              <span className="gallery-item-veil" aria-hidden="true" />
              <span className="gallery-item-content">
                <span className="gallery-item-tag">{item.tag}</span>
                <span className="gallery-item-title">{item.title}</span>
              </span>
              <span className="gallery-item-cta" aria-hidden="true">
                <span className="gallery-item-cta-label">Open Workflow</span>
                <span className="gallery-item-cta-arrow">→</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeWorkflowId && (
          <WorkflowModal
            key={activeWorkflowId}
            workflowId={activeWorkflowId}
            onClose={() => setActiveWorkflowId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
