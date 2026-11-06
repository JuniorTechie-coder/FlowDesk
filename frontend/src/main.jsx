import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./toast.css";
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ToastProvider } from './toast.jsx'
import { NavigationProvider } from './navigation-context.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
