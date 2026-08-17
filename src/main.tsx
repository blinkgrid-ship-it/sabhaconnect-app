import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { DemoProvider } from './demo/DemoContext'
import { AppShell } from './app/AppShell'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <AppShell />
      </DemoProvider>
    </BrowserRouter>
  </StrictMode>,
)
