import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import './Hero.css';

const LINE_1 = 'Shape habits.';
const LINE_2_PREFIX = 'Predict';
const LINE_2_SUFFIX = 'outcomes';
const LINE_2 = `${LINE_2_PREFIX} ${LINE_2_SUFFIX}`;
const SCRAMBLE_GLYPHS = ['·', '•', '◦', '○', '*', '+', ':', '∙'];

/* Dot-matrix decode: characters resolve left-to-right from random dots. */
function useDecode(text, delay = 0, duration = 850) {
  const isReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [output, setOutput] = useState(() =>
    isReducedMotion() ? text : text.replace(/\S/g, SCRAMBLE_GLYPHS[0])
  );

  useEffect(() => {
    if (isReducedMotion()) return undefined;

    let raf;
    const startedAt = performance.now() + delay;

    const tick = (now) => {
      if (now < startedAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min((now - startedAt) / duration, 1);
      const revealed = Math.floor(t * text.length);
      if (t >= 1) {
        setOutput(text);
        return;
      }
      const next = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return '\u00A0';
          if (i < revealed) return char;
          return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        })
        .join('');
      setOutput(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, duration]);

  return output;
}

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

  const line1 = useDecode(LINE_1, 300, 800);
  const line2Tail = useDecode(LINE_2_SUFFIX, 900, 800);

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
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-label={`${LINE_1} ${LINE_2}`}
        >
          <span className="hero-line">{line1}</span>
          <span className="hero-line">
            <motion.span
              className="hero-accent"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.5 }}
            >
              {LINE_2_PREFIX}
              <span className="hero-accent-underline" aria-hidden="true" />
            </motion.span>
            <span aria-hidden="true">{line2Tail}</span>
          </span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.5 }}
        >
          An AI coach that keeps you in flow — and simulates where today&rsquo;s
          decisions lead.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
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
