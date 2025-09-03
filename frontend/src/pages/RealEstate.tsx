import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Building2 } from 'lucide-react'
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

interface Property {
  _id: string
  propertyType: 'buy' | 'sell'
  area: number
  areaUnit: 'Bigha' | 'Gaj'
  partnerName: string
  sellerName?: string
  buyerName?: string
  ratePerUnit: number
  totalCost: number
  amountPaid: number
  amountPending: number
  transactionDate: string
  notes?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RealEstate = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null)

  const [form, setForm] = useState({
    propertyType: 'buy' as 'buy' | 'sell',
    area: '',
    areaUnit: 'Bigha' as 'Bigha' | 'Gaj',
    partnerName: '',
    sellerName: '',
    buyerName: '',
    ratePerUnit: '',
    totalCost: '',
    amountPaid: '',
    amountPending: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })

  useEffect(() => {
    fetchProperties()
    fetchPropertyAnalytics()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties')
      setProperties(response.data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertyAnalytics = async () => {
    try {
      const response = await api.get('/analytics/real-estate')
      setPropertyAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching property analytics:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProperty) {
        await api.put(`/properties/${editingProperty._id}`, form)
      } else {
        await api.post('/properties', form)
      }
      setShowForm(false)
      setEditingProperty(null)
      setForm({
        propertyType: 'buy',
        area: '',
        areaUnit: 'Bigha',
        partnerName: '',
        sellerName: '',
        buyerName: '',
        ratePerUnit: '',
        totalCost: '',
        amountPaid: '',
        amountPending: '',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      })
      fetchProperties()
      fetchPropertyAnalytics()
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const deleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${id}`)
        fetchProperties()
        fetchPropertyAnalytics()
      } catch (error) {
        console.error('Error deleting property:', error)
      }
    }
  }

  const editProperty = (property: Property) => {
    setEditingProperty(property)
    setForm({
      propertyType: property.propertyType,
      area: property.area.toString(),
      areaUnit: property.areaUnit,
      partnerName: property.partnerName,
      sellerName: property.sellerName || '',
      buyerName: property.buyerName || '',
      ratePerUnit: property.ratePerUnit.toString(),
      totalCost: property.totalCost.toString(),
      amountPaid: property.amountPaid.toString(),
      amountPending: property.amountPending.toString(),
      transactionDate: format(new Date(property.transactionDate), 'yyyy-MM-dd'),
      notes: property.notes || ''
    })
    setShowForm(true)
  }

  const calculateProfit = (property: Property) => {
    if (property.propertyType === 'sell') {
      return property.amountPaid - property.totalCost
    }
    return 0
  }

  const getTotalInvestment = () => {
    return properties.filter(p => p.propertyType === 'buy').reduce((sum, p) => sum + p.totalCost, 0)
  }

  const getTotalRevenue = () => {
    return properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0)
  }

  const getTotalPending = () => {
    return properties.reduce((sum, p) => sum + p.amountPending, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Real Estate Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your property transactions and track real estate investments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {properties.length}
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
                <TrendingUp className="h-6 w-6 text-green-600" />
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
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
      </div>

      {/* Charts */}
      {propertyAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partner Analytics Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Partner-wise Transaction Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(propertyAnalytics).map(([partner, data]: [string, any]) => ({
                partner,
                investment: data.totalInvestment,
                revenue: data.totalRevenue,
                profit: data.profit
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="partner" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="investment" fill="#EF4444" name="Investment" />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Property Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Buy', value: properties.filter(p => p.propertyType === 'buy').length },
                    { name: 'Sell', value: properties.filter(p => p.propertyType === 'sell').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} properties`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Properties List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Properties</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.propertyType === 'buy' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {property.propertyType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.partnerName}</div>
                      <div className="text-sm text-gray-500">
                        {property.propertyType === 'buy' 
                          ? `Seller: ${property.sellerName || 'N/A'}`
                          : `Buyer: ${property.buyerName || 'N/A'}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.area} {property.areaUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{property.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{property.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{property.amountPending.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editProperty(property)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProperty(property._id)}
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

      {/* Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <select
                    required
                    value={form.propertyType}
                    onChange={(e) => setForm(prev => ({ ...prev, propertyType: e.target.value as 'buy' | 'sell' }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.area}
                      onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    <select
                      value={form.areaUnit}
                      onChange={(e) => setForm(prev => ({ ...prev, areaUnit: e.target.value as 'Bigha' | 'Gaj' }))}
                      className="mt-1 block w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Bigha">Bigha</option>
                      <option value="Gaj">Gaj</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Partner Name</label>
                  <input
                    type="text"
                    required
                    value={form.partnerName}
                    onChange={(e) => setForm(prev => ({ ...prev, partnerName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                {form.propertyType === 'buy' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Name</label>
                    <input
                      type="text"
                      value={form.sellerName}
                      onChange={(e) => setForm(prev => ({ ...prev, sellerName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
                {form.propertyType === 'sell' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                    <input
                      type="text"
                      value={form.buyerName}
                      onChange={(e) => setForm(prev => ({ ...prev, buyerName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate per Unit</label>
                  <input
                    type="number"
                    required
                    value={form.ratePerUnit}
                    onChange={(e) => setForm(prev => ({ ...prev, ratePerUnit: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                  <input
                    type="number"
                    required
                    value={form.totalCost}
                    onChange={(e) => setForm(prev => ({ ...prev, totalCost: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                  <input
                    type="number"
                    required
                    value={form.amountPaid}
                    onChange={(e) => setForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount Pending</label>
                  <input
                    type="number"
                    required
                    value={form.amountPending}
                    onChange={(e) => setForm(prev => ({ ...prev, amountPending: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={form.transactionDate}
                    onChange={(e) => setForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    {editingProperty ? 'Update' : 'Add'} Property
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProperty(null)
                      setForm({
                        propertyType: 'buy',
                        area: '',
                        areaUnit: 'Bigha',
                        partnerName: '',
                        sellerName: '',
                        buyerName: '',
                        ratePerUnit: '',
                        totalCost: '',
                        amountPaid: '',
                        amountPending: '',
                        transactionDate: format(new Date(), 'yyyy-MM-dd'),
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

export default RealEstate 