import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import SmartGuidance from './pages/SmartGuidance.jsx';
import PriorityInsights from './pages/PriorityInsights.jsx';
import Privacy from './pages/Privacy.jsx';
import ChatBot from './pages/ChatBot.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smart-guidance" element={<SmartGuidance />} />
        <Route path="/priority-insights" element={<PriorityInsights />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/chat" element={<ChatBot />} />
      </Routes>
    </div>
  );
}

export default App;
