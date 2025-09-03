import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, DollarSign, Calendar, Clock, Users } from 'lucide-react'
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
  workerId: {
    _id: string
    name: string
    phone: string
  }
  amount: number
  date: string
  paymentMode: 'cash' | 'UPI'
  description?: string
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

const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showBulkAttendanceForm, setShowBulkAttendanceForm] = useState(false)
  const [showWorkerAttendanceView, setShowWorkerAttendanceView] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [workerAttendanceData, setWorkerAttendanceData] = useState<Attendance[]>([])
  const [workerAttendanceSummary, setWorkerAttendanceSummary] = useState<any>(null)

  const [workerForm, setWorkerForm] = useState({
    name: '',
    phone: '',
    address: '',
    joiningDate: format(new Date(), 'yyyy-MM-dd'),
    salary: '',
    notes: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    workerId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'cash' as 'cash' | 'UPI',
    description: ''
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
    fetchWorkers()
    fetchPayments()
    fetchAttendance()
  }, [])

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers')
      setWorkers(response.data)
    } catch (error) {
      console.error('Error fetching workers:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments')
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance')
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, paymentForm)
      } else {
        await api.post('/payments', paymentForm)
      }
      setShowPaymentForm(false)
      setEditingPayment(null)
      setPaymentForm({
        workerId: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'cash',
        description: ''
      })
      fetchPayments()
    } catch (error) {
      console.error('Error saving payment:', error)
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
      fetchAttendance()
      fetchWorkers() // Refresh workers to update totalWorkingDays
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
      fetchAttendance()
      fetchWorkers() // Refresh workers to update totalWorkingDays
    } catch (error) {
      console.error('Error saving bulk attendance:', error)
    }
  }

  const deleteAttendance = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await api.delete(`/attendance/${id}`)
        fetchAttendance()
        fetchWorkers() // Refresh workers to update totalWorkingDays
      } catch (error) {
        console.error('Error deleting attendance:', error)
      }
    }
  }

  const viewWorkerAttendance = async (worker: Worker) => {
    try {
      setSelectedWorker(worker)
      
      // Fetch attendance data for this specific worker
      const attendanceResponse = await api.get(`/attendance?workerId=${worker._id}`)
      setWorkerAttendanceData(attendanceResponse.data)
      
      // Fetch attendance summary for this worker
      const summaryResponse = await api.get(`/attendance/summary/worker/${worker._id}`)
      setWorkerAttendanceSummary(summaryResponse.data)
      
      setShowWorkerAttendanceView(true)
    } catch (error) {
      console.error('Error fetching worker attendance:', error)
    }
  }

  const deletePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await api.delete(`/payments/${id}`)
        fetchPayments()
      } catch (error) {
        console.error('Error deleting payment:', error)
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

  const editPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setPaymentForm({
      workerId: payment.workerId._id,
      amount: payment.amount.toString(),
      date: format(new Date(payment.date), 'yyyy-MM-dd'),
      paymentMode: payment.paymentMode,
      description: payment.description || ''
    })
    setShowPaymentForm(true)
  }

  const getWorkerPayments = (workerId: string) => {
    return payments.filter(p => p.workerId._id === workerId)
  }

  const getWorkerTotalPayments = (workerId: string) => {
    return getWorkerPayments(workerId).reduce((sum, p) => sum + p.amount, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Workers Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your workers and track their payments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowWorkerForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </button>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add Payment
          </button>
          <button
            onClick={() => setShowAttendanceForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Attendance
          </button>
          <button
            onClick={() => setShowBulkAttendanceForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Attendance
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      <div className="text-sm text-gray-500">{worker.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{worker.salary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{getWorkerTotalPayments(worker._id).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.totalWorkingDays || 0} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        worker.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {worker.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewWorkerAttendance(worker)}
                        className="text-purple-600 hover:text-purple-900"
                        title="View Attendance"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => editWorker(worker)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Worker"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteWorker(worker._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Worker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.slice(0, 10).map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.workerId.name}</div>
                      <div className="text-sm text-gray-500">{payment.workerId.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(payment.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.paymentMode === 'cash' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.paymentMode.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePayment(payment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.slice(0, 10).map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.workerId.name}</div>
                      <div className="text-sm text-gray-500">{record.workerId.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : record.status === 'half-day'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workingHours ? `${record.workingHours}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingAttendance(record)
                          setAttendanceForm({
                            workerId: record.workerId._id,
                            date: format(new Date(record.date), 'yyyy-MM-dd'),
                            status: record.status,
                            checkInTime: record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '',
                            checkOutTime: record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '',
                            workingHours: record.workingHours?.toString() || '',
                            notes: record.notes || ''
                          })
                          setShowAttendanceForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAttendance(record._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Worker Form Modal */}
      {showWorkerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h3>
              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    required
                    value={workerForm.address}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={workerForm.joiningDate}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    required
                    value={workerForm.salary}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, salary: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={workerForm.notes}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingWorker ? 'Update' : 'Add'} Worker
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
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAttendance ? 'Edit Attendance' : 'Add New Attendance'}
              </h3>
              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Worker</label>
                  <select
                    required
                    value={attendanceForm.workerId}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, workerId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Worker</option>
                    {workers.map(worker => (
                      <option key={worker._id} value={worker._id}>{worker.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    required
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value as 'present' | 'absent' | 'half-day' | 'leave' }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check In Time</label>
                  <input
                    type="time"
                    value={attendanceForm.checkInTime}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check Out Time</label>
                  <input
                    type="time"
                    value={attendanceForm.checkOutTime}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={attendanceForm.workingHours}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, workingHours: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    {editingAttendance ? 'Update' : 'Add'} Attendance
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
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPayment ? 'Edit Payment' : 'Add New Payment'}
              </h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Worker</label>
                  <select
                    required
                    value={paymentForm.workerId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, workerId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Worker</option>
                    {workers.map(worker => (
                      <option key={worker._id} value={worker._id}>{worker.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                  <select
                    required
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {editingPayment ? 'Update' : 'Add'} Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false)
                      setEditingPayment(null)
                      setPaymentForm({
                        workerId: '',
                        amount: '',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        paymentMode: 'cash',
                        description: ''
                      })
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Attendance Entry</h3>
              <form onSubmit={handleBulkAttendanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    value={bulkAttendanceForm.date}
                    onChange={(e) => setBulkAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Worker Attendance</label>
                  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4">
                    {workers.map((worker) => {
                      const existingRecord = bulkAttendanceForm.attendanceData.find(
                        record => record.workerId === worker._id
                      )
                      return (
                        <div key={worker._id} className="flex items-center space-x-4 py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{worker.name}</div>
                            <div className="text-xs text-gray-500">{worker.phone}</div>
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
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="half-day">Half Day</option>
                            <option value="leave">Leave</option>
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Save All Attendance
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
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Worker Attendance View Modal */}
      {showWorkerAttendanceView && selectedWorker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Attendance Record for {selectedWorker.name}
                </h3>
                <button
                  onClick={() => {
                    setShowWorkerAttendanceView(false)
                    setSelectedWorker(null)
                    setWorkerAttendanceData([])
                    setWorkerAttendanceSummary(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Attendance Summary Cards */}
              {workerAttendanceSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{workerAttendanceSummary.presentDays}</div>
                    <div className="text-sm text-green-600">Present Days</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{workerAttendanceSummary.absentDays}</div>
                    <div className="text-sm text-red-600">Absent Days</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{workerAttendanceSummary.halfDays}</div>
                    <div className="text-sm text-yellow-600">Half Days</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{workerAttendanceSummary.leaveDays}</div>
                    <div className="text-sm text-blue-600">Leave Days</div>
                  </div>
                </div>
              )}

              {/* Quick Add Attendance */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Quick Add Today's Attendance</h4>
                <div className="flex items-center space-x-4">
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value as 'present' | 'absent' | 'half-day' | 'leave' }))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                  <input
                    type="time"
                    value={attendanceForm.checkInTime}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                    placeholder="Check In"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={attendanceForm.checkOutTime}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    placeholder="Check Out"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={attendanceForm.workingHours}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, workingHours: e.target.value }))}
                    placeholder="Hours"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-20"
                  />
                  <button
                    onClick={async () => {
                      try {
                        await api.post('/attendance', {
                          ...attendanceForm,
                          workerId: selectedWorker._id,
                          date: format(new Date(), 'yyyy-MM-dd')
                        })
                        // Refresh attendance data
                        viewWorkerAttendance(selectedWorker)
                        // Reset form
                        setAttendanceForm({
                          workerId: '',
                          date: format(new Date(), 'yyyy-MM-dd'),
                          status: 'present',
                          checkInTime: '',
                          checkOutTime: '',
                          workingHours: '',
                          notes: ''
                        })
                      } catch (error) {
                        console.error('Error adding attendance:', error)
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Add Today
                  </button>
                </div>
              </div>

              {/* Attendance Records Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900">Attendance History</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workerAttendanceData.map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : record.status === 'half-day'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.checkInTime ? format(new Date(`2000-01-01T${record.checkInTime}`), 'HH:mm') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.checkOutTime ? format(new Date(`2000-01-01T${record.checkOutTime}`), 'HH:mm') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.workingHours ? `${record.workingHours}h` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                            {record.notes || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setEditingAttendance(record)
                                setAttendanceForm({
                                  workerId: record.workerId._id,
                                  date: format(new Date(record.date), 'yyyy-MM-dd'),
                                  status: record.status,
                                  checkInTime: record.checkInTime ? format(new Date(`2000-01-01T${record.checkInTime}`), 'HH:mm') : '',
                                  checkOutTime: record.checkOutTime ? format(new Date(`2000-01-01T${record.checkOutTime}`), 'HH:mm') : '',
                                  workingHours: record.workingHours?.toString() || '',
                                  notes: record.notes || ''
                                })
                                setShowAttendanceForm(true)
                                setShowWorkerAttendanceView(false)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAttendance(record._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {workerAttendanceData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found for this worker.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workers 