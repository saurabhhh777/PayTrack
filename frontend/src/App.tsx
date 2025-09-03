import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Attendance from './pages/Attendance'
import Agriculture from './pages/Agriculture'
import CultivationDetail from './pages/CultivationDetail'
import RealEstate from './pages/RealEstate'
import Meel from './pages/Meel'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workers" element={<Workers />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="agriculture" element={<Agriculture />} />
        <Route path="cultivations/:id" element={<CultivationDetail />} />
        <Route path="real-estate" element={<RealEstate />} />
        <Route path="meel" element={<Meel />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App 