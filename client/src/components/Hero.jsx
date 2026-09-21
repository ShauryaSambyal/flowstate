import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import './Hero.css';

const LINE_1 = 'Shape habits.';
const LINE_2_PREFIX = 'Predict';
const LINE_2_SUFFIX = 'outcomes';

const Hero = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async () => {
    if (user) {
      navigate('/smart-guidance');
    } else {
      try {
        const loggedInUser = await signInWithGoogle();
        if (loggedInUser) navigate('/smart-guidance');
      } catch (err) {
        console.error('Hero action error:', err);
      }
    }
  };

  /* The same entrance the rest of the page uses for its sections — fade in
     with a short upward rise over 0.6s, staggered by 0.1s (see BentoGrid, FAQ
     and the Gallery cards), just run immediately since the hero is already in
     view. Skipped entirely when the visitor prefers reduced motion. */
  const reveal = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
        };

  return (
    <section className="hero">
      <div className="hero-meta mono-label">
        <span>FLOWSTATE — PERSONAL OS</span>
        <span>[ FLOW / 01 ]</span>
      </div>

      <span className="hero-crosshair tl" aria-hidden="true">+</span>
      <span className="hero-crosshair tr" aria-hidden="true">+</span>
      <span className="hero-crosshair bl" aria-hidden="true">+</span>
      <span className="hero-crosshair br" aria-hidden="true">+</span>

      <div className="container hero-container">
        <motion.h1 className="hero-title" {...reveal(0)}>
          <span className="hero-line">{LINE_1}</span>
          <span className="hero-line">
            <span className="hero-accent">
              {LINE_2_PREFIX}
              <span className="hero-accent-underline" aria-hidden="true" />
            </span>{' '}
            {LINE_2_SUFFIX}
          </span>
        </motion.h1>

        <motion.p className="hero-subtitle" {...reveal(0.1)}>
          An AI coach that keeps you in flow — and simulates where today&rsquo;s
          decisions lead.
        </motion.p>

        <motion.div className="hero-actions" {...reveal(0.2)}>
          <button className="btn-primary" onClick={handleAction}>
            {user ? 'Open AI Coach' : 'Start free'}
          </button>
          <a href="#solutions" className="btn-ghost">
            See what it does
          </a>
        </motion.div>
      </div>

      <button
        className="hero-scroll mono-label"
        onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Scroll to features"
      >
        SCROLL
        <span className="hero-scroll-dot" aria-hidden="true" />
      </button>
    </section>
  );
};

export default Hero;
