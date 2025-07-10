import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { QueryProvider } from './providers/QueryProvider'
// import { UserProvider } from './providers/UserProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
)
