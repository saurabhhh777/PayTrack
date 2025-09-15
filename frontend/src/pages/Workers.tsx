import React from "react"
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, DollarSign, Calendar, Users, Search, Filter, Phone, MapPin, TrendingUp, Clock, Eye } from 'lucide-react'
import { api } from '../lib/api'
import { format } from 'date-fns'

interface Worker {
  _id: string
  name: string
  phone: string
  address: string
  joiningDate: string
  salary: number
  isActive: boolean
  notes?: string
}

interface Payment {
  _id: string
  workerId: string | {
    _id: string
    name: string
    phone: string
  }
  amount: number
  date: string
  paymentMode: 'cash' | 'UPI'
  description?: string
}

const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [attendanceSummary, setAttendanceSummary] = useState<Record<string, { present: number; total: number }>>({})

  const [workerForm, setWorkerForm] = useState({
    name: '',
    phone: '',
    address: '',
    joiningDate: format(new Date(), 'yyyy-MM-dd'),
    salary: '',
    notes: ''
  })

  useEffect(() => {
    fetchWorkers()
    // fetchPayments depends on workers – it will be called inside fetchWorkers once workers are loaded
    fetchAttendance()
  }, [])

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers')
      setWorkers(response.data)
      // After workers are loaded, fetch their payments
      await fetchPaymentsForWorkers(response.data)
    } catch (error) {
      console.error('Error fetching workers:', error)
    }
  }

  const fetchPaymentsForWorkers = async (workersList: Worker[]) => {
    try {
      const results = await Promise.all(
        (workersList || []).map(w => api.get(`/worker-payments/worker/${w._id}`))
      )
      const allPayments = results.flatMap(r => r.data || [])
      setPayments(allPayments)
    } catch (error) {
      console.error('Error fetching worker payments:', error)
      setPayments([])
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/summary/overview')
      const map: Record<string, { present: number; total: number }> = {}
      for (const item of (res.data?.summary || [])) {
        map[item.workerId] = { present: item.present, total: item.total }
      }
      setAttendanceSummary(map)
    } catch (e) {
      console.error('Error fetching attendance summary:', e)
      setAttendanceSummary({})
    } finally {
      setLoading(false)
    }
  }

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingWorker) {
        await api.put(`/workers/${editingWorker._id}`, workerForm)
      } else {
        await api.post('/workers', workerForm)
      }
      setShowWorkerForm(false)
      setEditingWorker(null)
      setWorkerForm({
        name: '',
        phone: '',
        address: '',
        joiningDate: format(new Date(), 'yyyy-MM-dd'),
        salary: '',
        notes: ''
      })
      fetchWorkers()
    } catch (error) {
      console.error('Error saving worker:', error)
    }
  }

  const deleteWorker = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await api.delete(`/workers/${id}`)
        fetchWorkers()
      } catch (error) {
        console.error('Error deleting worker:', error)
      }
    }
  }

  const editWorker = (worker: Worker) => {
    setEditingWorker(worker)
    setWorkerForm({
      name: worker.name,
      phone: worker.phone,
      address: worker.address,
      joiningDate: format(new Date(worker.joiningDate), 'yyyy-MM-dd'),
      salary: worker.salary.toString(),
      notes: worker.notes || ''
    })
    setShowWorkerForm(true)
  }

  const getWorkerPayments = (workerId: string) => {
    return payments.filter(p => {
      const wid = typeof (p.workerId as any) === 'string' ? (p.workerId as any) : (p.workerId as { _id: string })._id
      return wid === workerId
    })
  }

  const getWorkerTotalPayments = (workerId: string) => {
    return getWorkerPayments(workerId).reduce((sum, p) => sum + p.amount, 0)
  }

  const getWorkerAttendanceStats = (workerId: string) => {
    const s = attendanceSummary[workerId] || { present: 0, total: 0 }
    const percentage = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    return { present: s.present, total: s.total, percentage }
  }

  // Filter workers based on search and status
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.phone.includes(searchTerm) ||
                         worker.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && worker.isActive) ||
                         (statusFilter === 'inactive' && !worker.isActive)
    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const totalWorkers = workers.length
  const activeWorkers = workers.filter(w => w.isActive).length
  const totalSalaryExpense = workers.reduce((sum, w) => sum + w.salary, 0)
  const totalPaymentsMade = payments.reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading workers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-medium mb-4">Workers Management</h1>
          <p className="text-xl text-blue-100 mb-6">
            Manage your workforce and track their performance
          </p>
          
          <button
            onClick={() => setShowWorkerForm(true)}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/30 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Add New Worker
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Workers</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">{totalWorkers}</p>
            <p className="text-sm text-green-600">{activeWorkers} active</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Payments</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{totalPaymentsMade.toLocaleString()}</p>
            <p className="text-sm text-green-600">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Attendance Rate</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">87%</p>
            <p className="text-sm text-green-600">This week</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Salary</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{totalSalaryExpense.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total expense</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Workers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium text-gray-900">Workers ({filteredWorkers.length})</h2>
          <div className="text-sm text-gray-500">
            Showing {filteredWorkers.length} of {totalWorkers} workers
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => {
            const attendanceStats = getWorkerAttendanceStats(worker._id)
            const totalPayments = getWorkerTotalPayments(worker._id)

            return (
              <div key={worker._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                      <Link
                        to={`/workers/${worker._id}`}
                      className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {worker.name}
                      </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        worker.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {worker.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => editWorker(worker)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Worker"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteWorker(worker._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Worker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
          </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{worker.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm truncate">{worker.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined {format(new Date(worker.joiningDate), 'MMM yyyy')}</span>
        </div>
      </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Salary</p>
                    <p className="text-lg font-medium text-gray-900">₹{worker.salary.toLocaleString()}</p>
          </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-lg font-medium text-green-600">₹{totalPayments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attendance</p>
                    <p className="text-lg font-medium text-blue-600">{attendanceStats.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Working Days</p>
                    <p className="text-lg font-medium text-gray-900">{attendanceStats.total}</p>
        </div>
      </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/workers/${worker._id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>
          </div>
        </div>
            )
          })}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No workers found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Worker Form Modal */}
      {showWorkerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[600px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                </h3>
                <button
                  onClick={() => {
                    setShowWorkerForm(false)
                    setEditingWorker(null)
                    setWorkerForm({
                      name: '',
                      phone: '',
                      address: '',
                      joiningDate: format(new Date(), 'yyyy-MM-dd'),
                      salary: '',
                      notes: ''
                    })
                  }}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleWorkerSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">👤 Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter worker's full name"
                        value={workerForm.name}
                        onChange={(e) => setWorkerForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={workerForm.phone}
                        onChange={(e) => setWorkerForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">🏠 Address</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                    <textarea
                      required
                      placeholder="Enter complete address"
                      value={workerForm.address}
                      onChange={(e) => setWorkerForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">💼 Employment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={workerForm.joiningDate}
                        onChange={(e) => setWorkerForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={workerForm.salary}
                          onChange={(e) => setWorkerForm(prev => ({ ...prev, salary: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">📝 Notes</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      placeholder="Add any additional notes..."
                      value={workerForm.notes}
                      onChange={(e) => setWorkerForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingWorker ? '🔄 Update Worker' : '👷 Add Worker'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkerForm(false)
                      setEditingWorker(null)
                      setWorkerForm({
                        name: '',
                        phone: '',
                        address: '',
                        joiningDate: format(new Date(), 'yyyy-MM-dd'),
                        salary: '',
                        notes: ''
                      })
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
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

export default Workers 