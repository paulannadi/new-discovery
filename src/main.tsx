import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// The settings provider makes the Discovery settings (enabled tabs + stopover
// airline) available to every screen. It wraps the whole app so the gear on the
// Discovery page and the flight screens all read from the same source.
import { SettingsProvider } from './shared/contexts/SettingsContext'
// Import our global styles — Tailwind, fonts, and design tokens
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>,
)
