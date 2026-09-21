import React, { useCallback, useEffect, useState } from 'react';
import { ThemeContext } from './context.js';

const MODE_KEY = 'flowstate.mode';

/* Mono is the one theme the site ships. Glass and neo were removed along with
   the switcher, but the [data-theme] token blocks stay in index.css so a future
   theme can be reintroduced without touching component code. */
const THEME = 'mono';

function getInitialMode() {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', THEME);
    root.style.colorScheme = mode;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

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
    <ThemeContext.Provider value={{ mode, theme: THEME, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
