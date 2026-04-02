import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n/config'
import { useAuthStore } from './store/authStore'
import { registerServiceWorker } from './lib/pwa'

// Initialize auth on app load (non-blocking)
useAuthStore.getState().initialize().catch(err => {
  console.error('Auth initialization failed:', err)
})

// Register PWA Service Worker
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
