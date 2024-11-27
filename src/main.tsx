import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { SidebarModalHandler } from './components/sidebar-modal-content.tsx'
import { ConversationProvider } from './context/ConversationContext.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { ModalProvider } from './context/ModalContext.tsx'
import { ModelProvider } from './context/ModelContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConversationProvider>
      <ModelProvider>
        <SidebarProvider>
          <ThemeProvider>
            <ModalProvider>
              <SidebarModalHandler />
              <App />
            </ModalProvider>
          </ThemeProvider>
        </SidebarProvider>
      </ModelProvider>
    </ConversationProvider>
  </StrictMode>,
)