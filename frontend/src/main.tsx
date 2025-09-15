import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

interface Attendance {
  _id: string
  workerId: { _id: string; name: string; phone: string }
  date: string
  status: 'Present' | 'Absent' | 'HalfDay' | 'present' | 'absent' | 'half-day' | 'leave'
  checkInTime?: string
  checkOutTime?: string
  workingHours?: number
  notes?: string
}

const normalizeStatus = (s: string) => {
  const up = (s || '').toLowerCase()
  if (up === 'present') return 'Present'
  if (up === 'absent') return 'Absent'
  if (up === 'half-day' || up === 'halfday') return 'HalfDay'
  return s
}

// Calculate stats
const totalRecords = attendance.length
const presentCount = attendance.filter(a => normalizeStatus(a.status) === 'Present').length
const absentCount  = attendance.filter(a => normalizeStatus(a.status) === 'Absent').length
const halfDayCount = attendance.filter(a => normalizeStatus(a.status) === 'HalfDay').length
const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

// Update helpers to use normalizeStatus inside

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 