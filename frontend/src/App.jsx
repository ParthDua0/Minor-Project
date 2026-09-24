import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import LearnAndPractice from './pages/LearnAndPractice'
import Introduction from './pages/Introduction'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learn-and-practice" element={<LearnAndPractice />} />
        <Route path="/introduction" element={<Introduction />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
