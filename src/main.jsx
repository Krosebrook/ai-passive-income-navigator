import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
// Safe addition: Initialize error logging before app starts
// Ensures all errors are captured from the beginning
// Uses console.error fallback if external service not configured
import '@/lib/errorLogger'
import { validateEnv } from '@/lib/env'

// Validate required environment variables before mounting the app.
// Throws in development; warns in production (see src/lib/env.js).
validateEnv()

// Error logger is auto-initialized with console fallback
// Can be configured later with Sentry DSN without changing app code

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
