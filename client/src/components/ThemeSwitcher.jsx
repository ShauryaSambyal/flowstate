import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/useTheme.js';
import './ThemeSwitcher.css';

/* Theme picking is gone — mono is the site's single theme — so this is now just
   the light/dark mode toggle. */
const ThemeSwitcher = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="theme-switcher">
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
    </div>
  );
};

export default ThemeSwitcher;
