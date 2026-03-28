import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SmartGuidance.css';

const SmartGuidance = () => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    try {
      const response = await axios.post('http://localhost:8080/ai/suggestions', { prompt });
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      } else {
        setError('Failed to get suggestions. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while connecting to the AI service.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
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
          <span className="page-tag">AI Powered</span>
          <h1 className="page-title">What's on your mind?</h1>
          <p className="page-subtitle">Type a word or phrase, and our AI will guide your next steps.</p>
        </motion.div>

        <motion.div 
          className="input-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="e.g., Focus, Deep Work, Procrastination..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
              ) : 'Get Guidance'}
            </button>
          </div>
        </motion.div>

        <div className="suggestions-section">
          {error && <p className="error-message">{error}</p>}
          
          <AnimatePresence mode="wait">
            {suggestions.length > 0 && (
              <motion.div 
                key="suggestions"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="suggestions-list"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="suggestion-item"
                  >
                    <div className="suggestion-bullet"></div>
                    <p>{suggestion}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {loading && suggestions.length === 0 && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="loading-placeholder"
              >
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default SmartGuidance;
