import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Users, Filter, Download } from 'lucide-react'
import { api } from '../lib/api'
import { format } from 'date-fns'

interface Worker {
  _id: string
  name: string
  phone: string
  address: string
  totalWorkingDays: number
}

interface Attendance {
  _id: string
  workerId: {
    _id: string
    name: string
    phone: string
  }
  date: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
  checkInTime?: string
  checkOutTime?: string
  workingHours?: number
  notes?: string
}

const Attendance = () => {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showBulkAttendanceForm, setShowBulkAttendanceForm] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [filters, setFilters] = useState({
    workerId: '',
    status: '',
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  const [attendanceForm, setAttendanceForm] = useState({
    workerId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present' as 'present' | 'absent' | 'half-day' | 'leave',
    checkInTime: '',
    checkOutTime: '',
    workingHours: '',
    notes: ''
  })

  const [bulkAttendanceForm, setBulkAttendanceForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    attendanceData: [] as Array<{
      workerId: string
      status: 'present' | 'absent' | 'half-day' | 'leave'
      checkInTime?: string
      checkOutTime?: string
      workingHours?: string
      notes?: string
    }>
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [workersRes, attendanceRes] = await Promise.all([
        api.get('/workers'),
        api.get('/attendance', { params: filters })
      ])
      setWorkers(workersRes.data)
      setAttendance(attendanceRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAttendance) {
        await api.put(`/attendance/${editingAttendance._id}`, attendanceForm)
      } else {
        await api.post('/attendance', attendanceForm)
      }
      setShowAttendanceForm(false)
      setEditingAttendance(null)
      setAttendanceForm({
        workerId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        workingHours: '',
        notes: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error saving attendance:', error)
    }
  }

  const handleBulkAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/attendance/bulk', bulkAttendanceForm)
      setShowBulkAttendanceForm(false)
      setBulkAttendanceForm({
        date: format(new Date(), 'yyyy-MM-dd'),
        attendanceData: []
      })
      fetchData()
    } catch (error) {
      console.error('Error saving bulk attendance:', error)
    }
  }

  const deleteAttendance = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await api.delete(`/attendance/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting attendance:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'half-day': return 'bg-yellow-100 text-yellow-800'
      case 'leave': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅'
      case 'absent': return '❌'
      case 'half-day': return '⚠️'
      case 'leave': return '🏖️'
      default: return '❓'
    }
  }

  const exportAttendanceData = () => {
    const csvContent = [
      ['Date', 'Worker Name', 'Phone', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Notes'].join(','),
      ...attendance.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.workerId.name,
        record.workerId.phone,
        record.status,
        record.checkInTime || '',
        record.checkOutTime || '',
        record.workingHours || '',
        record.notes || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage worker attendance records
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowAttendanceForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Attendance
          </button>
          <button
            onClick={() => setShowBulkAttendanceForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Attendance
          </button>
          <button
            onClick={exportAttendanceData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-purple-500" />
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.workerId}
              onChange={(e) => setFilters(prev => ({ ...prev, workerId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            >
              <option value="">👥 All Workers</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            >
              <option value="">📊 All Status</option>
              <option value="present">✅ Present</option>
              <option value="absent">❌ Absent</option>
              <option value="half-day">⚠️ Half Day</option>
              <option value="leave">🏖️ Leave</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                <dd className="text-2xl font-bold text-gray-900">{attendance.length}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.status === 'present').length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-xl">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.status === 'absent').length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <span className="text-2xl">🏖️</span>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Leave</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.status === 'leave').length}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">📊 Attendance Records</h3>
            <div className="text-sm text-gray-500">
              Total: {attendance.length} record{attendance.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'dd/MMM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold text-sm">
                            {record.workerId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{record.workerId.name}</div>
                          <div className="text-xs text-gray-500">{record.workerId.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(record.status)}</span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.checkInTime ? format(new Date(`2000-01-01T${record.checkInTime}`), 'HH:mm') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.checkOutTime ? format(new Date(`2000-01-01T${record.checkOutTime}`), 'HH:mm') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {record.workingHours ? `${record.workingHours}h` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingAttendance(record)
                            setAttendanceForm({
                              workerId: record.workerId._id,
                              date: format(new Date(record.date), 'yyyy-MM-dd'),
                              status: record.status,
                              checkInTime: record.checkInTime || '',
                              checkOutTime: record.checkOutTime || '',
                              workingHours: record.workingHours?.toString() || '',
                              notes: record.notes || ''
                            })
                            setShowAttendanceForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAttendance(record._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendance.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                <p className="text-gray-500 mb-4">No attendance records match the selected filters.</p>
                <button
                  onClick={() => setShowAttendanceForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[500px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingAttendance ? 'Edit Attendance' : 'Add New Attendance'}
                </h3>
                <button
                  onClick={() => {
                    setShowAttendanceForm(false)
                    setEditingAttendance(null)
                    setAttendanceForm({
                      workerId: '',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      status: 'present',
                      checkInTime: '',
                      checkOutTime: '',
                      workingHours: '',
                      notes: ''
                    })
                  }}
                  className="text-white hover:text-purple-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                {/* Worker Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">👷 Select Worker *</label>
                  <select
                    required
                    value={attendanceForm.workerId}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, workerId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Choose a worker</option>
                    {workers.map(worker => (
                      <option key={worker._id} value={worker._id}>{worker.name} - {worker.phone}</option>
                    ))}
                  </select>
                </div>

                {/* Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date *</label>
                    <input
                      type="date"
                      required
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📊 Status *</label>
                    <select
                      required
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value as 'present' | 'absent' | 'half-day' | 'leave' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="present">✅ Present</option>
                      <option value="absent">❌ Absent</option>
                      <option value="half-day">⚠️ Half Day</option>
                      <option value="leave">🏖️ Leave</option>
                    </select>
                  </div>
                </div>

                {/* Time Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🕐 Check In Time</label>
                    <input
                      type="time"
                      value={attendanceForm.checkInTime}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🕕 Check Out Time</label>
                    <input
                      type="time"
                      value={attendanceForm.checkOutTime}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Working Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="0.0"
                    value={attendanceForm.workingHours}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, workingHours: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notes</label>
                  <textarea
                    placeholder="Add any additional notes or comments..."
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingAttendance ? '🔄 Update Attendance' : '📝 Add Attendance'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttendanceForm(false)
                      setEditingAttendance(null)
                      setAttendanceForm({
                        workerId: '',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        status: 'present',
                        checkInTime: '',
                        checkOutTime: '',
                        workingHours: '',
                        notes: ''
                      })
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Form Modal */}
      {showBulkAttendanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[700px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  📊 Bulk Attendance Entry
                </h3>
                <button
                  onClick={() => {
                    setShowBulkAttendanceForm(false)
                    setBulkAttendanceForm({
                      date: format(new Date(), 'yyyy-MM-dd'),
                      attendanceData: []
                    })
                  }}
                  className="text-white hover:text-indigo-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleBulkAttendanceSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Select Date *</label>
                  <input
                    type="date"
                    required
                    value={bulkAttendanceForm.date}
                    onChange={(e) => setBulkAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                
                {/* Worker Attendance List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">👥 Worker Attendance Status</label>
                  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                    {workers.map((worker) => {
                      const existingRecord = bulkAttendanceForm.attendanceData.find(
                        record => record.workerId === worker._id
                      )
                      return (
                        <div key={worker._id} className="flex items-center justify-between py-3 px-4 border-b border-gray-200 last:border-b-0 bg-white rounded-lg mb-2 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{worker.name}</div>
                            <div className="text-sm text-gray-500">{worker.phone}</div>
                          </div>
                          <select
                            value={existingRecord?.status || 'present'}
                            onChange={(e) => {
                              const newData = [...bulkAttendanceForm.attendanceData]
                              const existingIndex = newData.findIndex(record => record.workerId === worker._id)
                              
                              if (existingIndex >= 0) {
                                newData[existingIndex].status = e.target.value as 'present' | 'absent' | 'half-day' | 'leave'
                              } else {
                                newData.push({
                                  workerId: worker._id,
                                  status: e.target.value as 'present' | 'absent' | 'half-day' | 'leave'
                                })
                              }
                              
                              setBulkAttendanceForm(prev => ({ ...prev, attendanceData: newData }))
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="present">✅ Present</option>
                            <option value="absent">❌ Absent</option>
                            <option value="half-day">⚠️ Half Day</option>
                            <option value="leave">🏖️ Leave</option>
                          </select>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total Workers: {workers.length} | Marked: {bulkAttendanceForm.attendanceData.length}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    💾 Save All Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkAttendanceForm(false)
                      setBulkAttendanceForm({
                        date: format(new Date(), 'yyyy-MM-dd'),
                        attendanceData: []
                      })
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance 