import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Benefits.css';

const BenefitItem = ({ tag, title, description, icon: Icon, index }) => {
  const isEven = index % 2 === 0;

  return (
    <div className="benefit-item">
      <motion.div 
        className="benefit-content"
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="benefit-tag">{tag}</span>
        <h3 className="benefit-title">{title}</h3>
        <p className="benefit-description">{description}</p>
      </motion.div>

      <motion.div 
        className="benefit-image-container"
        initial={{ opacity: 0, scale: 0.9, x: isEven ? 50 : -50 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="benefit-image-placeholder">
          {Icon}
          <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.5 }}>Workflow mockup</p>
        </div>
      </motion.div>
    </div>
  );
};

const Benefits = () => {
  const benefits = [
    {
      tag: "Guided action feed",
      title: "Focus on what matters most.",
      description: "Our AI-powered feed filters out the noise and presents you with the most impactful actions you can take right now to stay on track.",
            icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.2 }}>
          <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
        </svg>
      )
    },
    {
      tag: "Intent recognition",
      title: "Anticipate your next move.",
      description: "By analyzing your patterns and current context, Flowstate recognizes your intent and prepares the tools you need before you even ask for them.",
            icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.2 }}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      )
    },
    {
      tag: "Priority insights",
      title: "Real-time performance metrics.",
      description: "Get immediate feedback on your productivity and flow state. Visualize how small changes in your routine lead to massive improvements over time.",
            icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.2 }}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    }
  ];

  return (
    <section className="benefits" id="about">
      <div className="container">
        {benefits.map((benefit, index) => (
          <BenefitItem key={index} {...benefit} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Benefits;
