import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SmartGuidance.css';

const SmartGuidance = () => {
  const [prompt, setPrompt] = useState('');
  const [guidanceData, setGuidanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Autocomplete state
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const dropdownRef = useRef(null);

  const keywords = [
    "Study HTML", "Study React", "Study JavaScript", "Study CSS", 
    "Deep Work", "Focus Mode", "Mental Clarity", "Productivity Hack",
    "Exercise", "Meditation", "Morning Routine", "Sleep Optimization",
    "Breaking Procrastination", "Goal Setting", "Time Management"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    
    if (value.trim().length > 0) {
      const filtered = keywords.filter(k => 
        k.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredKeywords(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const selectKeyword = (keyword) => {
    setPrompt(keyword);
    setShowDropdown(false);
  };

  const fetchSuggestions = async () => {
    const finalPrompt = prompt.trim();
    if (!finalPrompt) return;
    
    setLoading(true);
    setError(null);
    setGuidanceData(null);
    setShowDropdown(false);
    
    try {
      const response = await axios.post('http://localhost:8080/ai/suggestions', { prompt: finalPrompt });
      if (response.data.success) {
        setGuidanceData(response.data.data);
        // Save to localStorage for Life Outcomes section
        localStorage.setItem('flowstate_life_outcomes', JSON.stringify({
          impact: response.data.data.impact,
          goal: finalPrompt,
          timestamp: new Date().toISOString()
        }));
      } else {
        setError('Failed to get guidance. Please try again.');
      }
    } catch (err) {
      console.error("Axios Error:", err.response?.data || err.message);
      setError(`Error: ${err.response?.data?.error || err.message || 'Connection failed'}`);
    } finally {
      setLoading(false);
    }
  };

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
          <span className="page-tag">Ultimate Roadmap</span>
          <h1 className="page-title">Chart Your Path</h1>
          <p className="page-subtitle">Type your goal and let AI create a personalized roadmap with future impact analysis.</p>
        </motion.div>

        <motion.div 
          className="input-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="input-relative" ref={dropdownRef}>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="e.g., Master React, Public Speaking, Fitness Goal..." 
                value={prompt}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
                disabled={loading}
                autoFocus
              />
              <button 
                className="btn-primary fetch-btn" 
                onClick={fetchSuggestions}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                     className="loader"
                   />
                ) : 'Generate Roadmap'}
              </button>
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="autocomplete-dropdown"
                >
                  {filteredKeywords.map((k, i) => (
                    <div 
                      key={i} 
                      className="dropdown-item"
                      onClick={() => selectKeyword(k)}
                    >
                      {k}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="output-section">
          {error && <p className="error-message">{error}</p>}
          
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
                  <h3 className="section-label">THE PATHWAY</h3>
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
                  <h3 className="section-label">FUTURE IMPACT</h3>
                  <motion.div 
                    variants={containerVariants}
                    className="impact-grid"
                  >
                    {[
                      { time: '1 Month', text: guidanceData.impact.oneMonth, delay: 0.1 },
                      { time: '3 Months', text: guidanceData.impact.threeMonths, delay: 0.2 },
                      { time: '6 Months', text: guidanceData.impact.sixMonths, delay: 0.3 }
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

export default SmartGuidance;
