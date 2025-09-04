import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CheckCircle, AlertCircle, Calendar, DollarSign, Users, Phone, MapPin } from 'lucide-react'
import { api } from '../lib/api'
import { format } from 'date-fns'

interface WorkerPayment {
  _id: string
  amount: number
  date: string
  paymentMode: 'cash' | 'UPI'
  description?: string
  createdAt: string
}

interface Attendance {
  _id: string
  date: string
  status: 'Present' | 'Absent' | 'HalfDay'
  notes?: string
  createdAt: string
}

interface Worker {
  _id: string
  name: string
  phone: string
  address: string
  joiningDate: string
  salary: number
  isActive: boolean
  notes?: string
  attendance?: Attendance[]
  payments?: WorkerPayment[]
  attendanceSummary?: {
    totalDays: number
    present: number
    absent: number
    halfDay: number
  }
  paymentSummary?: {
    totalSalary: number
    paid: number
    pending: number
  }
}

const WorkerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'cash' as 'cash' | 'UPI',
    description: ''
  })
  const [attendanceForm, setAttendanceForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present' as 'Present' | 'Absent' | 'HalfDay',
    notes: ''
  })

  useEffect(() => {
    if (id) {
      fetchWorker()
    }
  }, [id])

  const fetchWorker = async () => {
    try {
      const response = await api.get(`/workers/${id}`)
      setWorker(response.data)
    } catch (error) {
      console.error('Error fetching worker:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!worker) return
    
    try {
      const paymentData = {
        ...paymentForm,
        workerId: worker._id,
        amount: parseFloat(paymentForm.amount)
      }
      
      await api.post('/worker-payments', paymentData)
      
      // Reset form and refresh worker data
      setPaymentForm({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'cash',
        description: ''
      })
      setShowPaymentForm(false)
      fetchWorker()
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!worker) return
    
    try {
      const attendanceData = {
        ...attendanceForm,
        workerId: worker._id
      }
      
      await api.post('/attendance', attendanceData)
      
      // Reset form and refresh worker data
      setAttendanceForm({
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Present',
        notes: ''
      })
      setShowAttendanceForm(false)
      fetchWorker()
    } catch (error) {
      console.error('Error adding attendance:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Worker Not Found</h2>
        <button
          onClick={() => navigate('/workers')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workers
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workers')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{worker.name}</h1>
            <p className="text-sm text-gray-500">Worker Profile & Details</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAttendanceForm(!showAttendanceForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Attendance
          </button>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Worker Information */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            👤 Worker Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-600">Name</div>
                  <div className="text-lg font-semibold text-blue-900">{worker.name}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-green-600">Phone</div>
                  <div className="text-lg font-semibold text-green-900">{worker.phone}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-purple-600">Monthly Salary</div>
                  <div className="text-lg font-semibold text-purple-900">₹{worker.salary.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-orange-600">Status</div>
                  <div className="text-lg font-semibold text-orange-900 capitalize">{worker.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <strong>Address:</strong> {worker.address}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <strong>Joining Date:</strong> {format(new Date(worker.joiningDate), 'PPP')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            📅 Attendance Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Total Days</div>
              <div className="text-lg font-semibold text-blue-900">{worker.attendanceSummary?.totalDays || 0}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Present</div>
              <div className="text-lg font-semibold text-green-900">{worker.attendanceSummary?.present || 0}</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-600">Absent</div>
              <div className="text-lg font-semibold text-red-900">{worker.attendanceSummary?.absent || 0}</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-600">Half Day</div>
              <div className="text-lg font-semibold text-yellow-900">{worker.attendanceSummary?.halfDay || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            💰 Payment Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Total Salary</div>
              <div className="text-lg font-semibold text-blue-900">₹{worker.paymentSummary?.totalSalary || 0}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Paid</div>
              <div className="text-lg font-semibold text-green-900">₹{worker.paymentSummary?.paid || 0}</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600">Pending</div>
              <div className="text-lg font-semibold text-orange-900">₹{worker.paymentSummary?.pending || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Form */}
      {showPaymentForm && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                  <select
                    required
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="Optional payment description"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  💰 Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attendance Form */}
      {showAttendanceForm && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Attendance</h3>
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    required
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value as 'Present' | 'Absent' | 'HalfDay' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Present">✅ Present</option>
                    <option value="Absent">❌ Absent</option>
                    <option value="HalfDay">⏰ Half Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  placeholder="Optional attendance notes"
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  📅 Add Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setShowAttendanceForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            💰 Payment History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {worker.payments && worker.payments.length > 0 ? (
                  worker.payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(payment.date), 'PPP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.paymentMode === 'cash' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.paymentMode === 'cash' ? '💵 Cash' : '📱 UPI'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.description || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                        <p className="text-gray-500 mb-4">Add your first payment to track this worker's salary.</p>
                        <button
                          onClick={() => setShowPaymentForm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            📅 Attendance History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {worker.attendance && worker.attendance.length > 0 ? (
                  worker.attendance.map((attendance) => (
                    <tr key={attendance._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(attendance.date), 'PPP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                          attendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendance.status === 'Present' ? '✅ Present' :
                           attendance.status === 'Absent' ? '❌ Absent' :
                           '⏰ Half Day'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
                        <p className="text-gray-500 mb-4">Add your first attendance record to track this worker's attendance.</p>
                        <button
                          onClick={() => setShowAttendanceForm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Attendance
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDetail 