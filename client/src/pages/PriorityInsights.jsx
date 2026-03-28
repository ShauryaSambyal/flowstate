import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SmartGuidance.css'; // Reusing the same beautiful styles

const PriorityInsights = () => {
  const [guidanceData, setGuidanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Automatically generate the roadmap on mount
    const fetchPriorityRoadmap = async () => {
      try {
        setLoading(true);
        const response = await axios.post('https://flowstate-tvmf.onrender.com/ai/suggestions', { 
            prompt: "how to effectively spend your day for maximum productivity" 
        });
        
        if (response.data.success) {
          setGuidanceData(response.data.data);
          // Save to localStorage for Life Outcomes section
          localStorage.setItem('flowstate_life_outcomes', JSON.stringify({
            impact: response.data.data.impact,
            goal: "Optimal Productivity Schedule",
            timestamp: new Date().toISOString()
          }));
        } else {
          setError('Failed to generate insights. Please try again.');
        }
      } catch (err) {
        console.error("Axios Error:", err.response?.data || err.message);
        setError(`Error: ${err.response?.data?.error || err.message || 'Connection failed'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityRoadmap();
  }, []);

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

  const roadmapItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const impactVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

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
          <span className="page-tag">Priority Insights</span>
          <h1 className="page-title">Your Optimal Day</h1>
          <p className="page-subtitle">AI-generated schedule and roadmap designed for peak productivity and flow.</p>
        </motion.div>

        <div className="output-section">
          {error && (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {guidanceData && (
              <motion.div 
                key="guidance-content"
                initial="hidden"
                animate="visible"
                className="guidance-container"
              >
                {/* Roadmap Section */}
                <div className="roadmap-section">
                  <h3 className="section-label">DAILY ROADMAP</h3>
                  <motion.div variants={containerVariants} className="roadmap-timeline">
                    {guidanceData.roadmap.map((item, index) => (
                      <motion.div 
                        key={index} 
                        variants={roadmapItemVariants}
                        className="roadmap-step"
                      >
                        <div className="step-indicator">
                          <div className="step-dot"></div>
                          {index < guidanceData.roadmap.length - 1 && <div className="step-line"></div>}
                        </div>
                        <div className="step-content">
                          <h4>{item.phase}</h4>
                          <p>{item.details}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Impact Section */}
                <div className="impact-section">
                  <h3 className="section-label">EXPECTED OUTCOMES</h3>
                  <motion.div 
                    variants={containerVariants}
                    className="impact-grid"
                  >
                    {[
                      { time: '1 Month', text: guidanceData.impact.oneMonth },
                      { time: '3 Months', text: guidanceData.impact.threeMonths },
                      { time: '6 Months', text: guidanceData.impact.sixMonths }
                    ].map((card, i) => (
                      <motion.div 
                        key={i}
                        variants={impactVariants}
                        className="impact-card"
                      >
                        <div className="impact-time">{card.time}</div>
                        <p className="impact-desc">{card.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="loading-placeholder"
              >
                <div className="skeleton-label"></div>
                <div className="skeleton-step"></div>
                <div className="skeleton-step"></div>
                <div className="skeleton-step"></div>
                <div className="skeleton-impact-row">
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
};

export default PriorityInsights;
