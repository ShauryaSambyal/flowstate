import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithGoogle } from '../../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        navigate('/chat');
      }
    } catch (err) {
      console.error("Login Error:", err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error("Logout Error:", err.message);
    }
  };

  const navItems = [
    { title: 'Solutions', hasDropdown: true },
    { title: 'About', hasDropdown: false },
    { title: 'Blog', hasDropdown: false },
    { title: 'Support', hasDropdown: true },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <motion.div 
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="logo-icon"></div>
            <span>FLOWSTATE</span>
          </Link>
        </motion.div>

        <nav className="nav">
          <ul className="nav-list" style={{ display: 'flex', gap: '2rem' }}>
            {navItems.map((item, index) => (
              <motion.li 
                key={item.title} 
                className="nav-item"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a href={`#${item.title.toLowerCase()}`} className="nav-link">
                  {item.title}
                  {item.hasDropdown && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  )}
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>

        <motion.div 
          className="header-actions"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user ? (
            <div className="profile-menu-container" ref={dropdownRef}>
              <button 
                className="profile-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="profile-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="profile-avatar-fallback">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </button>
              
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div 
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="profile-dropdown-header">
                      <span className="profile-dropdown-name">{user.displayName}</span>
                      <span className="profile-dropdown-email">{user.email}</span>
                    </div>
                    <div className="profile-dropdown-divider"></div>
                    <ul className="profile-dropdown-list">
                      <li>
                        <button 
                          className="profile-dropdown-item-btn" 
                          onClick={() => { setProfileDropdownOpen(false); navigate('/chat'); }}
                        >
                          💬 AI Coach Chat
                        </button>
                      </li>
                      <li>
                        <button 
                          className="profile-dropdown-item-btn" 
                          onClick={() => { setProfileDropdownOpen(false); navigate('/'); }}
                        >
                          🏠 Home Dashboard
                        </button>
                      </li>
                      <div className="profile-dropdown-divider"></div>
                      <li>
                        <button className="profile-dropdown-item-btn logout-btn" onClick={handleLogout}>
                          🚪 Sign Out
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleLogin}>Start free</button>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            )}
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              padding: '2rem',
              zIndex: 999
            }}
          >
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {navItems.map((item) => (
                <li key={item.title}>
                  <a 
                    href={`#${item.title.toLowerCase()}`} 
                    className="nav-link"
                    style={{ fontSize: '1.25rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
              <li>
                {user ? (
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      navigate('/chat');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Open AI Coach
                  </button>
                ) : (
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Start free
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
