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
  cropName: string
  area: number
  ratePerBigha: number
  totalCost: number
  buyerName?: string
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
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCultivation, setEditingCultivation] = useState<Cultivation | null>(null)
  const [cropAnalytics, setCropAnalytics] = useState<any>(null)

  const [form, setForm] = useState({
    cropName: '',
    area: '',
    ratePerBigha: '',
    totalCost: '',
    buyerName: '',
    amountReceived: '',
    amountPending: '',
    paymentMode: 'cash' as 'cash' | 'UPI',
    cultivationDate: format(new Date(), 'yyyy-MM-dd'),
    harvestDate: '',
    notes: ''
  })

  useEffect(() => {
    fetchCultivations()
    fetchCropAnalytics()
  }, [])

  const fetchCultivations = async () => {
    try {
      const response = await api.get('/cultivations')
      setCultivations(response.data)
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
    try {
      if (editingCultivation) {
        await api.put(`/cultivations/${editingCultivation._id}`, form)
      } else {
        await api.post('/cultivations', form)
      }
      setShowForm(false)
      setEditingCultivation(null)
      setForm({
        cropName: '',
        area: '',
        ratePerBigha: '',
        totalCost: '',
        buyerName: '',
        amountReceived: '',
        amountPending: '',
        paymentMode: 'cash',
        cultivationDate: format(new Date(), 'yyyy-MM-dd'),
        harvestDate: '',
        notes: ''
      })
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
      cropName: cultivation.cropName,
      area: cultivation.area.toString(),
      ratePerBigha: cultivation.ratePerBigha.toString(),
      totalCost: cultivation.totalCost.toString(),
      buyerName: cultivation.buyerName || '',
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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Area</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getTotalCultivatedArea()} Bigha
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Investment</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{getTotalInvestment().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{getTotalRevenue().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
                  <dd className={`text-lg font-medium ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{getTotalProfit().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{getTotalPending().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {cropAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crop Profit Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop-wise Profit Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(cropAnalytics).map(([crop, data]: [string, any]) => ({
                crop,
                profit: data.profit,
                cost: data.totalCost,
                revenue: data.totalReceived
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
                <Bar dataKey="cost" fill="#EF4444" name="Cost" />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Crop Area Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Area Distribution</h3>
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(cropAnalytics).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} Bigha`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cultivations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cultivations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cultivations.map((cultivation) => (
                  <tr key={cultivation._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cultivation.cropName}</div>
                      <div className="text-sm text-gray-500">
                        {cultivation.buyerName && `Buyer: ${cultivation.buyerName}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cultivation.area} Bigha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{cultivation.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{cultivation.amountReceived.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        calculateProfit(cultivation) >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        ₹{calculateProfit(cultivation).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{cultivation.amountPending.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editCultivation(cultivation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCultivation(cultivation._id)}
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

      {/* Cultivation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCultivation ? 'Edit Cultivation' : 'Add New Cultivation'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={form.cropName}
                    onChange={(e) => setForm(prev => ({ ...prev, cropName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area (Bigha)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.area}
                    onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate per Bigha</label>
                  <input
                    type="number"
                    required
                    value={form.ratePerBigha}
                    onChange={(e) => setForm(prev => ({ ...prev, ratePerBigha: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                  <input
                    type="number"
                    required
                    value={form.totalCost}
                    onChange={(e) => setForm(prev => ({ ...prev, totalCost: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                  <input
                    type="text"
                    value={form.buyerName}
                    onChange={(e) => setForm(prev => ({ ...prev, buyerName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Received</label>
                  <input
                    type="number"
                    required
                    value={form.amountReceived}
                    onChange={(e) => setForm(prev => ({ ...prev, amountReceived: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Pending</label>
                  <input
                    type="number"
                    required
                    value={form.amountPending}
                    onChange={(e) => setForm(prev => ({ ...prev, amountPending: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                  <select
                    required
                    value={form.paymentMode}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'UPI' }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cultivation Date</label>
                  <input
                    type="date"
                    required
                    value={form.cultivationDate}
                    onChange={(e) => setForm(prev => ({ ...prev, cultivationDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                  <input
                    type="date"
                    value={form.harvestDate}
                    onChange={(e) => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {editingCultivation ? 'Update' : 'Add'} Cultivation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCultivation(null)
                      setForm({
                        cropName: '',
                        area: '',
                        ratePerBigha: '',
                        totalCost: '',
                        buyerName: '',
                        amountReceived: '',
                        amountPending: '',
                        paymentMode: 'cash',
                        cultivationDate: format(new Date(), 'yyyy-MM-dd'),
                        harvestDate: '',
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
    </div>
  )
}

export default Agriculture 