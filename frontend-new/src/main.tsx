import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import App from './App.tsx'
import { setupKeyboardFocusDetection } from './utils/accessibility'

// 키보드 포커스 감지 설정
setupKeyboardFocusDetection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
