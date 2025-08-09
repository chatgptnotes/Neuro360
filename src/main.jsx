import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import console error fixer for cleaner development experience
import consoleErrorFixer from './utils/consoleErrorFixer.js'
import './utils/globalErrorHandler.js'

// Initialize console error suppression in development
if (import.meta.env.DEV) {
  consoleErrorFixer.init();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  import.meta.env.PROD ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
)
