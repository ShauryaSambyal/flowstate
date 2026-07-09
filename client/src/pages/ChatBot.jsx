import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header.jsx';
import axios from 'axios';
import './ChatBot.css';

const ChatBot = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser && !authLoading) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate, authLoading]);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (!user) return;

    const fetchChatHistory = async () => {
      try {
        setError(null);
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://flowstate-tvmf.onrender.com';
        const response = await axios.get(`${apiBaseUrl}/api/v1/users/chat-history`, {
          params: { email: user.email }
        });
        if (response.data.success) {
          setMessages(response.data.chatHistory || []);
        }
      } catch (err) {
        console.error("Fetch chat history error:", err);
        setError("Could not load previous chat history. Starting a new session.");
      }
    };

    fetchChatHistory();
  }, [user]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || loading || !user) return;

    // Add user message locally first
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://flowstate-tvmf.onrender.com';
      const response = await axios.post(`${apiBaseUrl}/api/v1/users/chat`, {
        email: user.email,
        message: text
      });

      if (response.data.success) {
        setMessages(response.data.chatHistory);
      } else {
        setError("Failed to get response from AI. Please try again.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("AI service is currently unavailable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown formatting helper (bold text and bullet items)
  const formatMessageContent = (text) => {
    if (!text) return "";
    
    // Split by lines
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Check for bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={index} className="chat-bullet-item">
            {parseBoldText(trimmed.substring(2))}
          </li>
        );
      }
      
      // Empty lines
      if (!trimmed) {
        return <div key={index} className="chat-paragraph-gap" />;
      }
      
      // Paragraph
      return (
        <p key={index} className="chat-paragraph">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
  };

  if (authLoading) {
    return (
      <div className="chat-loading-screen">
        <div className="spinner"></div>
        <p>Loading your flow workspace...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="chat-page-wrapper">
      <Header />

      <div className="chat-main-container">
        <motion.div 
          className="chat-window-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Chat Window Header */}
          <div className="chat-window-header">
            <div className="coach-info">
              <div className="coach-avatar">⚡</div>
              <div className="coach-meta">
                <h2>FLOWSTATE AI</h2>
                <span className="coach-status">● Peak Performance Coach</span>
              </div>
            </div>
            {messages.length > 0 && (
              <button 
                className="clear-history-btn"
                onClick={() => setMessages([])}
                title="Clear visual log (history remains in cloud)"
              >
                Clear Log
              </button>
            )}
          </div>

          {/* Chat Messages Body */}
          <div className="chat-messages-body">
            {messages.length === 0 ? (
              <div className="chat-welcome-state">
                <div className="welcome-icon">🧘</div>
                <h3>Welcome back, {user.displayName || 'Achiever'}!</h3>
                <p>
                  I'm your Flowstate AI Coach. Tell me what skills you want to master, 
                  obstacles you're facing, or ask for a productive schedule for your goals today!
                </p>
                <div className="suggested-prompts-grid">
                  {[
                    "How do I plan my day for deep work?",
                    "Generate a study roadmap for React.",
                    "How can I break procrastination?",
                  ].map((promptText, idx) => (
                    <button 
                      key={idx} 
                      className="suggested-prompt-card"
                      onClick={() => setInputText(promptText)}
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-scroller">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
                    <div className="message-bubble">
                      <div className="bubble-content">
                        {formatMessageContent(msg.content)}
                      </div>
                      <span className="bubble-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="message-bubble-wrapper assistant">
                    <div className="message-bubble loading-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="chat-system-error">
                    <span>⚠️</span> {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Form Input */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Ask anything about productivity, skills, or schedules..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={loading || !inputText.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </motion.div>
      </div>

      <div className="bg-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
};

export default ChatBot;
