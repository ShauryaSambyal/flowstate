import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import SmartGuidance from './pages/SmartGuidance.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smart-guidance" element={<SmartGuidance />} />
      </Routes>
    </div>
  );
}

export default App;
