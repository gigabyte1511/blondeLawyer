import { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/homePage'
import { ConsultationDetails } from './pages/consultationDetails'
import { Navigation } from './components/navigation'
import { NewConsultationForm } from './pages/newConsultationForm'
import { Toaster } from "@/components/ui/sonner"


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      <Toaster />
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/consultation/:id" element={<ConsultationDetails />} />
        <Route path="/consultation/new" element={<NewConsultationForm/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
