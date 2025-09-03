import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const Agriculture = () => {
  const [cultivations, setCultivations] = useState<Cultivation[]>([])
  const [filteredCultivations, setFilteredCultivations] = useState<Cultivation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCultivation, setEditingCultivation] = useState<Cultivation | null>(null)
  const [cropAnalytics, setCropAnalytics] = useState<any>(null)

  const initialFormState = {
    name: '',
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
  }

  const [form, setForm] = useState(initialFormState)

  const resetForm = () => {
    setForm(initialFormState)
  }

  useEffect(() => {
    fetchCultivations()
    fetchCropAnalytics()
  }, [])

  // Auto-calculate total cost when area or rate changes
  useEffect(() => {
    if (form.area && form.ratePerBigha) {
      const area = parseFloat(form.area)
      const rate = parseFloat(form.ratePerBigha)
      if (!isNaN(area) && !isNaN(rate)) {
        const totalCost = area * rate
        setForm(prev => ({ 
          ...prev, 
          totalCost: totalCost.toString(),
          amountPending: totalCost.toString() // Set initial pending amount
        }))
      }
    }
  }, [form.area, form.ratePerBigha])

  // Auto-calculate amount pending when amount received or total cost changes
  useEffect(() => {
    if (form.totalCost) {
      const totalCost = parseFloat(form.totalCost)
      const amountReceived = parseFloat(form.amountReceived) || 0
      
      if (!isNaN(totalCost)) {
        const amountPending = Math.max(0, totalCost - amountReceived)
        setForm(prev => ({ ...prev, amountPending: amountPending.toString() }))
      }
    }
  }, [form.amountReceived, form.totalCost])

  // Filter cultivations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCultivations(cultivations)
    } else {
      const filtered = cultivations.filter(cultivation =>
        cultivation.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCultivations(filtered)
    }
  }, [searchTerm, cultivations])

  const fetchCultivations = async () => {
    try {
      const response = await api.get('/cultivations')
      setCultivations(response.data)
      setFilteredCultivations(response.data)
    } catch (error) {
      console.error('Error fetching cultivations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCropAnalytics = async () => {
    try {
      const response = await api.get('/analytics/agriculture')
      setCropAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching crop analytics:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate Amount Received
    const totalCost = parseFloat(form.totalCost) || 0
    const amountReceived = parseFloat(form.amountReceived) || 0
    
    if (amountReceived > totalCost) {
      alert('Amount Received cannot be greater than Total Cost')
      return
    }
    
    try {
      if (editingCultivation) {
        await api.put(`/cultivations/${editingCultivation._id}`, form)
      } else {
        await api.post('/cultivations', form)
      }
      setShowForm(false)
      setEditingCultivation(null)
      resetForm()
      fetchCultivations()
      fetchCropAnalytics()
    } catch (error) {
      console.error('Error saving cultivation:', error)
    }
  }

  const deleteCultivation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cultivation?')) {
      try {
        await api.delete(`/cultivations/${id}`)
        fetchCultivations()
        fetchCropAnalytics()
      } catch (error) {
        console.error('Error deleting cultivation:', error)
      }
    }
  }

  const editCultivation = (cultivation: Cultivation) => {
    setEditingCultivation(cultivation)
    setForm({
      name: cultivation.name,
      cropName: cultivation.cropName,
      area: cultivation.area.toString(),
      ratePerBigha: cultivation.ratePerBigha.toString(),
      totalCost: cultivation.totalCost.toString(),
      paidTo: cultivation.paidTo || '',
      amountReceived: cultivation.amountReceived.toString(),
      amountPending: cultivation.amountPending.toString(),
      paymentMode: cultivation.paymentMode,
      cultivationDate: format(new Date(cultivation.cultivationDate), 'yyyy-MM-dd'),
      harvestDate: cultivation.harvestDate ? format(new Date(cultivation.harvestDate), 'yyyy-MM-dd') : '',
      notes: cultivation.notes || ''
    })
    setShowForm(true)
  }

  const calculateProfit = (cultivation: Cultivation) => {
    return cultivation.amountReceived - cultivation.totalCost
  }

  const getTotalCultivatedArea = () => {
    return cultivations.reduce((sum, c) => sum + c.area, 0)
  }

  const getTotalInvestment = () => {
    return cultivations.reduce((sum, c) => sum + c.totalCost, 0)
  }

  const getTotalRevenue = () => {
    return cultivations.reduce((sum, c) => sum + c.amountReceived, 0)
  }

  const getTotalPending = () => {
    return cultivations.reduce((sum, c) => sum + c.amountPending, 0)
  }

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalInvestment()
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
          <h1 className="text-2xl font-bold text-gray-900">Agriculture Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your crop cultivations and track agricultural investments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cultivation
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Area</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {getTotalCultivatedArea()} Bigha
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Investment</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  ₹{getTotalInvestment().toLocaleString()}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  ₹{getTotalRevenue().toLocaleString()}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
                <dd className={`text-2xl font-bold ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{getTotalProfit().toLocaleString()}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  ₹{getTotalPending().toLocaleString()}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {cropAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crop Profit Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">📊 Crop-wise Profit Analysis</h3>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Profit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Cost</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(cropAnalytics).map(([crop, data]: [string, any]) => ({
                crop,
                profit: data.profit,
                cost: data.totalCost,
                revenue: data.totalReceived
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="crop" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#EF4444" name="Cost" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Crop Area Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">🥧 Crop Area Distribution</h3>
              <div className="text-sm text-gray-500">Total: {Object.values(cropAnalytics).reduce((sum: any, data: any) => sum + (data as any).totalArea, 0) as number} Bigha</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(cropAnalytics).map(([crop, data]: [string, any]) => ({
                    name: crop,
                    value: data.totalArea
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(cropAnalytics).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} Bigha`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search by Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search cultivations by person's name (e.g., Raj, Rajkumar)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Showing {filteredCultivations.length} of {cultivations.length} cultivations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cultivations List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">🌾 Cultivations</h3>
            <div className="text-sm text-gray-500">
              Total: {filteredCultivations.length} cultivation{filteredCultivations.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Investment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCultivations.map((cultivation) => (
                  <tr key={cultivation._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cultivation.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold text-sm">
                            {cultivation.cropName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{cultivation.cropName}</div>
                          {cultivation.paidTo && (
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                              💰 Paid to: {cultivation.paidTo}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cultivation.area} Bigha</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{cultivation.totalCost.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₹{cultivation.amountReceived.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        calculateProfit(cultivation) >= 0 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {calculateProfit(cultivation) >= 0 ? '📈' : '📉'} ₹{calculateProfit(cultivation).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">₹{cultivation.amountPending.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => editCultivation(cultivation)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                          title="Edit Cultivation"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCultivation(cultivation._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                          title="Delete Cultivation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cultivations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cultivations yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first crop cultivation.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Cultivation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cultivation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[600px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingCultivation ? 'Edit Cultivation' : 'Add New Cultivation'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingCultivation(null)
                          setForm({
        name: '',
        cropName: '',
        area: '',
        ratePerBigha: '',
        totalCost: '',
        paidTo: '',
        amountReceived: '',
        amountPending: '',
        paymentMode: 'cash',
        cultivationDate: format(new Date(), 'yyyy-MM-dd'),
        harvestDate: '',
        notes: ''
      })
                  }}
                  className="text-white hover:text-green-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
                  
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the name of the person whose cultivation this is"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Wheat, Rice, Cotton"
                        value={form.cropName}
                        onChange={(e) => setForm(prev => ({ ...prev, cropName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area (Bigha) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={form.area}
                        onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Bigha *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={form.ratePerBigha}
                          onChange={(e) => setForm(prev => ({ ...prev, ratePerBigha: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Cost * 
                        <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={form.totalCost}
                          onChange={(e) => setForm(prev => ({ ...prev, totalCost: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-gray-50"
                          title="This field is automatically calculated from Area × Rate. You can edit it manually if needed."
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated as: {form.area && form.ratePerBigha ? `${form.area} × ₹${form.ratePerBigha} = ₹${form.totalCost || '0'}` : 'Enter Area and Rate to calculate'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buyer Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Buyer Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
                    <input
                      type="text"
                      placeholder="Enter buyer name (optional)"
                      value={form.paidTo}
                      onChange={(e) => setForm(prev => ({ ...prev, paidTo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={form.amountReceived}
                          onChange={(e) => setForm(prev => ({ ...prev, amountReceived: e.target.value }))}
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                            parseFloat(form.amountReceived) > parseFloat(form.totalCost) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {parseFloat(form.amountReceived) > parseFloat(form.totalCost) && (
                        <p className="text-xs text-red-500 mt-1">Amount Received cannot be greater than Total Cost</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Pending * 
                        <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={form.amountPending}
                          readOnly
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                          title="This field is automatically calculated as Total Cost - Amount Received"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated as: ₹{form.totalCost || '0'} - ₹{form.amountReceived || '0'} = ₹{form.amountPending || '0'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Paid To Field - Required only when Amount Received > 0 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid To {parseFloat(form.amountReceived) > 0 && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={parseFloat(form.amountReceived) > 0}
                      placeholder={parseFloat(form.amountReceived) > 0 ? "Enter who received the payment" : "Enter who received the payment (required if Amount Received > 0)"}
                      value={form.paidTo}
                      onChange={(e) => setForm(prev => ({ ...prev, paidTo: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        parseFloat(form.amountReceived) > 0 && !form.paidTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {parseFloat(form.amountReceived) > 0 && !form.paidTo && (
                      <p className="text-xs text-red-500 mt-1">Paid To is required when Amount Received is greater than 0</p>
                      )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                    <select
                      required
                      value={form.paymentMode}
                      onChange={(e) => setForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="UPI">📱 UPI</option>
                    </select>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Important Dates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cultivation Date *</label>
                      <input
                        type="date"
                        required
                        value={form.cultivationDate}
                        onChange={(e) => setForm(prev => ({ ...prev, cultivationDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                      <input
                        type="date"
                        value={form.harvestDate}
                        onChange={(e) => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Notes</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      placeholder="Add any additional notes or comments..."
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingCultivation ? '🔄 Update Cultivation' : '🌱 Add Cultivation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCultivation(null)
                      setForm({
                        name: '',
                        cropName: '',
                        area: '',
                        ratePerBigha: '',
                        totalCost: '',
                        paidTo: '',
                        amountReceived: '',
                        amountPending: '',
                        paymentMode: 'cash',
                        cultivationDate: format(new Date(), 'yyyy-MM-dd'),
                        harvestDate: '',
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
    </div>
  )
}

export default Agriculture 