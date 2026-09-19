import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

const baseName = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '')
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={baseName}>
      <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
