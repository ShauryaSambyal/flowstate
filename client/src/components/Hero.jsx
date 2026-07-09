import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import './Hero.css';

const Hero = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async () => {
    if (user) {
      navigate('/chat');
    } else {
      try {
        const loggedInUser = await signInWithGoogle();
        if (loggedInUser) {
          navigate('/chat');
        }
      } catch (err) {
        console.error("Hero action error:", err);
      }
    }
  };

  const line1 = "Shape habits.";
  const line2 = "Predict outcomes.";

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const textToWords = (text) => text.split(" ").map(word => word + "\u00A0");

  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="container">
        <motion.h1 
          className="hero-title"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {textToWords(line1).map((word, index) => (
            <motion.span 
              key={index} 
              style={{ display: 'inline-block' }} 
              variants={child}
            >
              {word}
            </motion.span>
          ))}
          <br />
          {textToWords(line2).map((word, index) => (
            <motion.span 
              key={index} 
              style={{ display: 'inline-block' }} 
              variants={child}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          An AI-powered coach that helps you stay in flow, achieve your goals, 
          and simulate your future based on today's decisions.
        </motion.p>

        <motion.div 
          className="hero-actions"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <button className="btn-primary" onClick={handleAction}>
            {user ? 'Open AI Coach' : 'Start free'}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
