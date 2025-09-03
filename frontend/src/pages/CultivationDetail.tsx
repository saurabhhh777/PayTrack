import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import { format } from 'date-fns'

interface Payment {
  _id: string
  amount: number
  paidTo: string
  paymentMode: string
  date: string
  createdAt: string
}

interface Cultivation {
  _id: string
  name: string
  cropName: string
  area: number
  ratePerBigha: number
  totalCost: number
  paidTo?: string
  amountReceived: number
  amountPending: number
  paymentMode: 'cash' | 'UPI'
  cultivationDate: string
  harvestDate?: string
  notes?: string
  payments?: Payment[]
}

const CultivationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cultivation, setCultivation] = useState<Cultivation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidTo: '',
    paymentMode: 'cash' as 'cash' | 'UPI' | 'bank',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    if (id) {
      fetchCultivation()
    }
  }, [id])

  const fetchCultivation = async () => {
    try {
      const response = await api.get(`/cultivations/${id}`)
      setCultivation(response.data)
    } catch (error) {
      console.error('Error fetching cultivation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cultivation) return
    
    try {
      const paymentData = {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        cultivationId: cultivation._id
      }
      
      await api.post('/payments', paymentData)
      
      // Reset form and refresh cultivation data
      setPaymentForm({
        amount: '',
        paidTo: '',
        paymentMode: 'cash',
        date: format(new Date(), 'yyyy-MM-dd')
      })
      setShowPaymentForm(false)
      fetchCultivation()
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const calculateTotalReceived = () => {
    if (!cultivation?.payments) return cultivation?.amountReceived || 0
    return cultivation.payments.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const calculatePending = () => {
    if (!cultivation) return 0
    const totalReceived = calculateTotalReceived()
    return Math.max(0, cultivation.totalCost - totalReceived)
  }

  const calculateProfit = () => {
    if (!cultivation) return 0
    const totalReceived = calculateTotalReceived()
    return totalReceived - cultivation.totalCost
  }

  const isPaidInFull = () => {
    return calculatePending() <= 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cultivation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cultivation Not Found</h2>
        <button
          onClick={() => navigate('/agriculture')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agriculture
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
            onClick={() => navigate('/agriculture')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cultivation.name}</h1>
            <p className="text-sm text-gray-500">Cultivation Details</p>
          </div>
        </div>
        
        {isPaidInFull() && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            Paid in Full
          </div>
        )}
      </div>

      {/* Cultivation Summary */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            🌾 Cultivation Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Crop Name</div>
              <div className="text-lg font-semibold text-blue-900">{cultivation.cropName}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Area (Bigha)</div>
              <div className="text-lg font-semibold text-green-900">{cultivation.area}</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-600">Investment</div>
              <div className="text-lg font-semibold text-red-900">₹{cultivation.totalCost.toLocaleString()}</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-600">Rate per Bigha</div>
              <div className="text-lg font-semibold text-yellow-900">₹{cultivation.ratePerBigha.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Revenue</div>
              <div className="text-lg font-semibold text-blue-900">₹{calculateTotalReceived().toLocaleString()}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Profit</div>
              <div className={`text-lg font-semibold ${calculateProfit() >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                ₹{calculateProfit().toLocaleString()}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600">Pending</div>
              <div className="text-lg font-semibold text-orange-900">₹{calculatePending().toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Cultivation Date:</strong> {format(new Date(cultivation.cultivationDate), 'PPP')}
              {cultivation.harvestDate && (
                <span className="ml-4">
                  <strong>Harvest Date:</strong> {format(new Date(cultivation.harvestDate), 'PPP')}
                </span>
              )}
            </div>
            {cultivation.notes && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Notes:</strong> {cultivation.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              💰 Payment History
            </h2>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </button>
          </div>

          {/* Add Payment Form */}
          {showPaymentForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payment</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Received *
                    </label>
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
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid To *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter who received the payment"
                      value={paymentForm.paidTo}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paidTo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mode *
                    </label>
                    <select
                      required
                      value={paymentForm.paymentMode}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' | 'bank' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="UPI">📱 UPI</option>
                      <option value="bank">🏦 Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
          )}

          {/* Payment List */}
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
                    Paid To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cultivation.payments && cultivation.payments.length > 0 ? (
                  cultivation.payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(payment.date), 'PPP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paidTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.paymentMode === 'cash' ? 'bg-green-100 text-green-800' :
                          payment.paymentMode === 'UPI' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {payment.paymentMode === 'cash' ? '💵 Cash' :
                           payment.paymentMode === 'UPI' ? '📱 UPI' :
                           '🏦 Bank'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                        <p className="text-gray-500 mb-4">Add your first payment to track this cultivation's financial status.</p>
                        <button
                          onClick={() => setShowPaymentForm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
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
    </div>
  )
}

export default CultivationDetail 