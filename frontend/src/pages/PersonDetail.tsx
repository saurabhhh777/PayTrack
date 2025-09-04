import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CheckCircle,  } from 'lucide-react'
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
  totalReceived: number
  profit: number
}

interface Person {
  _id: string
  name: string
  phone?: string
  address?: string
  notes?: string
  cultivations: Cultivation[]
  totals: {
    investment: number
    revenue: number
    pending: number
    profit: number
  }
}

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCultivationForm, setShowCultivationForm] = useState(false)
  const [cultivationForm, setCultivationForm] = useState({
    cropName: '',
    area: '',
    ratePerBigha: '',
    totalCost: '',
    paidTo: '',
    amountReceived: '0',
    amountPending: '',
    paymentMode: 'cash' as 'cash' | 'UPI',
    cultivationDate: format(new Date(), 'yyyy-MM-dd'),
    harvestDate: '',
    notes: ''
  })

  useEffect(() => {
    if (id) {
      fetchPerson()
    }
  }, [id])

  const fetchPerson = async () => {
    try {
      const response = await api.get(`/persons/${id}`)
      setPerson(response.data)
    } catch (error) {
      console.error('Error fetching person:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCultivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!person) return
    
    try {
      const formData = {
        ...cultivationForm,
        personId: person._id,
        area: parseFloat(cultivationForm.area) || 0,
        ratePerBigha: parseFloat(cultivationForm.ratePerBigha) || 0,
        totalCost: parseFloat(cultivationForm.totalCost) || 0,
        amountReceived: parseFloat(cultivationForm.amountReceived) || 0,
        amountPending: parseFloat(cultivationForm.amountPending) || 0
      }
      
      await api.post('/cultivations', formData)
      
      // Reset form and refresh person data
      setCultivationForm({
        cropName: '',
        area: '',
        ratePerBigha: '',
        totalCost: '',
        paidTo: '',
        amountReceived: '0',
        amountPending: '',
        paymentMode: 'cash',
        cultivationDate: format(new Date(), 'yyyy-MM-dd'),
        harvestDate: '',
        notes: ''
      })
      setShowCultivationForm(false)
      fetchPerson()
    } catch (error) {
      console.error('Error adding cultivation:', error)
    }
  }

  const isPaidInFull = (cultivation: Cultivation) => {
    return cultivation.amountPending <= 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Person Not Found</h2>
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
            <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
            <p className="text-sm text-gray-500">Person Profile & Cultivations</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCultivationForm(!showCultivationForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cultivation
        </button>
      </div>

      {/* Person Info */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            👤 Person Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="text-lg font-semibold text-gray-900">{person.name}</div>
            </div>
            
            {person.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="text-lg text-gray-900">{person.phone}</div>
              </div>
            )}
            
            {person.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="text-lg text-gray-900">{person.address}</div>
              </div>
            )}
            
            {person.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <div className="text-lg text-gray-900">{person.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Person Totals */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            📊 Overall Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-600">Total Investment</div>
              <div className="text-lg font-semibold text-red-900">₹{person.totals.investment.toLocaleString()}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Total Revenue</div>
              <div className="text-lg font-semibold text-blue-900">₹{person.totals.revenue.toLocaleString()}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Total Profit</div>
              <div className={`text-lg font-semibold ${person.totals.profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {person.totals.profit >= 0 ? '📈' : '📉'} ₹{person.totals.profit.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600">Total Pending</div>
              <div className="text-lg font-semibold text-orange-900">₹{person.totals.pending.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Cultivation Form */}
      {showCultivationForm && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
              🌾 Add New Cultivation
            </h2>
            
            <form onSubmit={handleCultivationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter crop name"
                    value={cultivationForm.cropName}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, cropName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (Bigha) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={cultivationForm.area}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Bigha *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={cultivationForm.ratePerBigha}
                      onChange={(e) => setCultivationForm(prev => ({ ...prev, ratePerBigha: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={cultivationForm.totalCost}
                      onChange={(e) => setCultivationForm(prev => ({ ...prev, totalCost: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                  <select
                    required
                    value={cultivationForm.paymentMode}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cultivation Date *</label>
                  <input
                    type="date"
                    required
                    value={cultivationForm.cultivationDate}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, cultivationDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                  <input
                    type="date"
                    value={cultivationForm.harvestDate}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={cultivationForm.notes}
                    onChange={(e) => setCultivationForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  🌾 Add Cultivation
                </button>
                <button
                  type="button"
                  onClick={() => setShowCultivationForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cultivations List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            🌾 Cultivations ({person.cultivations.length})
          </h2>
          
          {person.cultivations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cultivations yet</h3>
              <p className="text-gray-500 mb-4">Add your first cultivation to get started.</p>
              <button
                onClick={() => setShowCultivationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Cultivation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {person.cultivations.map((cultivation) => (
                <div
                  key={cultivation._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-blue-50"
                  onClick={() => navigate(`/cultivations/${cultivation._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{cultivation.cropName}</h3>
                    {isPaidInFull(cultivation) && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid in Full
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area:</span>
                      <span className="text-sm font-medium text-gray-900">{cultivation.area} Bigha</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investment:</span>
                      <span className="text-sm font-medium text-red-600">₹{cultivation.totalCost.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue:</span>
                      <span className="text-sm font-medium text-blue-600">₹{cultivation.totalReceived.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit:</span>
                      <span className={`text-sm font-medium ${cultivation.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cultivation.profit >= 0 ? '📈' : '📉'} ₹{cultivation.profit.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending:</span>
                      <span className="text-sm font-medium text-orange-600">₹{cultivation.amountPending.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <div>Cultivation: {format(new Date(cultivation.cultivationDate), 'MMM dd, yyyy')}</div>
                      {cultivation.harvestDate && (
                        <div>Harvest: {format(new Date(cultivation.harvestDate), 'MMM dd, yyyy')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <span className="text-xs text-blue-600 font-medium">Click to view details</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonDetail 