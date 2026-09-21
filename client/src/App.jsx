import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import SmartGuidance from './pages/SmartGuidance.jsx';
import PriorityInsights from './pages/PriorityInsights.jsx';
import Privacy from './pages/Privacy.jsx';
import BlogPage from './pages/BlogPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smart-guidance" element={<SmartGuidance />} />
        <Route path="/priority-insights" element={<PriorityInsights />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/chat" element={<Navigate to="/smart-guidance" replace />} />
      </Routes>
    </div>
  );
}

export default App;
