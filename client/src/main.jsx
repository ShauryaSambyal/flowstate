import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { warmUpApi } from './api/client.js'
import './index.css'
import App from './App.jsx'

// The backend sleeps when idle, so start waking it while the page renders
// instead of making the first AI request wait out the whole cold start.
warmUpApi()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
