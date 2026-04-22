import {Routes, Route} from 'react-router'
import React from 'react'

import Navbar from './components/Navbar.jsx'
import PerformanceDashboard from './pages/PerformanceDashboard.jsx'
import CompareCandidates from './pages/CompareCandidates.jsx'
import HiringPrediction from './pages/HiringPrediction.jsx'
import RecruiterPerformance from './pages/RecruiterPerformance.jsx'
import EmailNotifications from './pages/EmailNotifications.jsx'
import toast from 'react-hot-toast'


const App = () => {
  return (
  <div data-theme = "winter">
    <Navbar />
    <Routes>
      <Route path="/" element={<PerformanceDashboard />} />
      <Route path="/compare" element={<CompareCandidates />} />
      <Route path="/predict" element={<HiringPrediction />} />
      <Route path="/emails" element={<EmailNotifications />} />
      <Route path="/recruiter-performance" element={<RecruiterPerformance />} />
    </Routes>
  </div>
  )
};

export default App
