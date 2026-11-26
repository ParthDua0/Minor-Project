import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import LearnAndPractice from './pages/LearnAndPractice'
import Introduction from './pages/Introduction'
import ProtectedRoute from './routes/ProtectedRoute'
import Jobs from './pages/Jobs'
import SkillGaps from './pages/SkillGaps'
import RecruiterJobs from './pages/RecruiterJobs'
import ForgotPassword from './pages/ForgotPassword'
import Compiler from './pages/Compiler'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/learn-and-practice" element={<LearnAndPractice />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/skill-gaps" element={<SkillGaps />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App
