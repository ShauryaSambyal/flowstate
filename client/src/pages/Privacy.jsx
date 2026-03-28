import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './SmartGuidance.css'; // Reusing established premium styles

const Privacy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const sections = [
    {
      title: "1. How We Scramble Your Messages",
      content: "Every time you send a message to FLOWSTATE, we \"lock\" it using high-level encryption. Think of it like putting your letter in a digital safe before it travels across the internet. Only our system has the key to open it, meaning hackers or outsiders cannot read your private conversations while they are being sent.",
      icon: "🔐"
    },
    {
      title: "2. Our \"Vault\" (The Database)",
      content: "We store your data in a highly secure digital warehouse. We have designed our database so that it is \"leak-proof.\" Locked at Rest: Even when your data is just sitting on our servers, it is encrypted. Strict Access: Only the most essential parts of our system can \"talk\" to the database. Privacy Filters: Our AI is trained to focus on your questions, not your identity.",
      icon: "🏢"
    },
    {
      title: "3. Your Part in Staying Safe",
      content: "Security is a two-way street. We promise to keep our \"vault\" locked, but you are responsible for keeping your password secret, making sure nobody is looking over your shoulder while you type, and logging out if you are using a computer that isn't yours.",
      icon: "🛡️"
    },
    {
      title: "4. The Reality Check",
      content: "While we use the best technology available to keep FLOWSTATE a \"leak-free\" zone, the internet is never 100% perfect. We do everything humanly (and digitally) possible to protect you, but we cannot be held responsible for things outside of our control, like a virus on your personal phone.",
      icon: "⚡"
    },
    {
      title: "5. Updates",
      content: "As technology gets better, our encryption gets better too. We might update these rules from time to time to make sure your data stays as safe as possible.",
      icon: "🔄"
    }
  ];

  return (
    <div className="smart-guidance-page">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Flow
      </Link>

      <div className="content-container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="header-section"
        >
          <span className="page-tag">Digital Privacy</span>
          <h1 className="page-title">Encryption & Data Safety</h1>
          <p className="page-subtitle">By using FLOWSTATE, you agree to the following rules regarding how we handle and protect your messages.</p>
        </motion.div>

        <motion.div 
          className="guidance-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ marginTop: '3rem' }}
        >
          <div className="roadmap-section">
            <h3 className="section-label">THE PRIVACY VAULT</h3>
            <div className="roadmap-timeline">
              {sections.map((section, index) => (
                <motion.div 
                  key={index} 
                  variants={cardVariants}
                  className="roadmap-step"
                >
                  <div className="step-indicator">
                    <div className="step-dot" style={{ background: '#4b5563', boxShadow: '0 0 15px rgba(75, 85, 99, 0.4)' }}></div>
                    {index < sections.length - 1 && <div className="step-line" style={{ background: 'linear-gradient(to bottom, #4b5563, transparent)' }}></div>}
                  </div>
                  <div className="step-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>
                        <h4 style={{ margin: 0 }}>{section.title}</h4>
                    </div>
                    <p style={{ fontSize: '1.1rem', maxWidth: '800px' }}>{section.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-decorations">
        <div className="blob blob-1" style={{ backgroundColor: 'rgba(75, 85, 99, 0.1)' }}></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
};

export default Privacy;
