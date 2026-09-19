import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/useTheme.js';
import './ThemeSwitcher.css';

const THEME_LABELS = {
  glass: 'GLASS',
  neo: 'NEO',
  mono: 'MONO',
};

const THEME_DESCRIPTIONS = {
  glass: 'frosted panels, soft light',
  neo: 'extruded surfaces, no borders',
  mono: 'pure grid, hard edges',
};

const ThemeSwitcher = () => {
  const { mode, toggleMode, theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="theme-switcher" ref={rootRef}>
      <button
        type="button"
        className="mode-toggle"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mode-toggle-icon"
          >
            {mode === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </motion.span>
        </AnimatePresence>
      </button>

      <button
        type="button"
        className="theme-pick"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change design theme"
      >
        <span className="theme-pick-label">{THEME_LABELS[theme]}</span>
        <svg
          className={`theme-pick-caret ${open ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="theme-menu"
            role="listbox"
            aria-label="Design themes"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {themes.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  role="option"
                  aria-selected={t === theme}
                  className={`theme-menu-item ${t === theme ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                >
                  <span className="theme-menu-name">{THEME_LABELS[t]}</span>
                  <span className="theme-menu-desc">{THEME_DESCRIPTIONS[t]}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
