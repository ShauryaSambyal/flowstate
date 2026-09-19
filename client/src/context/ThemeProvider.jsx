import React, { useEffect, useState, useCallback } from 'react';
import { ThemeContext, THEMES } from './context.js';

const DEFAULT_THEME = 'glass';
const MODE_KEY = 'flowstate.mode';
const THEME_KEY = 'flowstate.theme';

function getInitialMode() {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = mode;
    try {
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [mode, theme]);

  // Follow OS changes until the user makes an explicit choice.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      try {
        if (!localStorage.getItem(MODE_KEY)) setMode(e.matches ? 'dark' : 'light');
      } catch {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggleMode, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
