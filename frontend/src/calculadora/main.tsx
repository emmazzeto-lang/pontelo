import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './calculadora.css'
import Calculadora from './Calculadora'

createRoot(document.getElementById('calculadora')!).render(
  <StrictMode>
    <Calculadora />
  </StrictMode>,
)
