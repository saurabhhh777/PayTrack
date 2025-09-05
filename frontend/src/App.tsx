import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Home from "./pages/Home"
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import WorkerDetail from './pages/WorkerDetail'
import Attendance from './pages/Attendance'
import Agriculture from './pages/Agriculture'
import PersonDetail from './pages/PersonDetail'
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
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Signup />
      } />
      
      {/* Home page - standalone without sidebar and no authentication required */}
      <Route path="/" element={<Home />} />
      
      {/* All other pages - with Layout (sidebar) */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workers" element={<Workers />} />
        <Route path="workers/:id" element={<WorkerDetail />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="agriculture" element={<Agriculture />} />
        <Route path="person/:id" element={<PersonDetail />} />
        <Route path="cultivations/:id" element={<CultivationDetail />} />
        <Route path="real-estate" element={<RealEstate />} />
        <Route path="meel" element={<Meel />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Direct routes for backward compatibility */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/workers" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Workers />} />
        <Route path=":id" element={<WorkerDetail />} />
      </Route>
      <Route path="/attendance" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Attendance />} />
      </Route>
      <Route path="/agriculture" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Agriculture />} />
      </Route>
      <Route path="/person/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<PersonDetail />} />
      </Route>
      <Route path="/cultivations/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<CultivationDetail />} />
      </Route>
      <Route path="/real-estate" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RealEstate />} />
      </Route>
      <Route path="/meel" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Meel />} />
      </Route>
      <Route path="/profile" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App 