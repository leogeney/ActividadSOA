import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Parcial1 from './Parcial1.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Parcial1/>
  </StrictMode>,
)
