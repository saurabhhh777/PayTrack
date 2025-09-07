import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Building2, Search, DollarSign, Filter } from 'lucide-react'
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

const RealEstate = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all')

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

  // Filter properties based on search and type
  useEffect(() => {
    let filtered = properties

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(property => 
        property.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => property.propertyType === typeFilter)
    }

    setFilteredProperties(filtered)
  }, [searchTerm, typeFilter, properties])

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties')
      setProperties(response.data)
      setFilteredProperties(response.data)
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

  const getTotalInvestment = () => {
    return properties.filter(p => p.propertyType === 'buy').reduce((sum, p) => sum + p.totalCost, 0)
  }

  const getTotalRevenue = () => {
    return properties.filter(p => p.propertyType === 'sell').reduce((sum, p) => sum + p.amountPaid, 0)
  }

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalInvestment()
  }

  const getTotalPending = () => {
    return properties.reduce((sum, p) => sum + p.amountPending, 0)
  }

  const getBuyProperties = () => {
    return properties.filter(p => p.propertyType === 'buy').length
  }

  const getSellProperties = () => {
    return properties.filter(p => p.propertyType === 'sell').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-medium mb-4">Real Estate Management</h1>
          <p className="text-xl text-purple-100 mb-6">
            Manage your property transactions and track real estate investments
          </p>
          
        <button
          onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/30 transition-all duration-200"
        >
            <Plus className="h-5 w-5" />
            Add Property Deal
        </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-6">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Properties</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">{properties.length}</p>
            <p className="text-sm text-gray-600">{getBuyProperties()} Buy • {getSellProperties()} Sell</p>
        </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm text-red-600">Investment</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Investment</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{getTotalInvestment().toLocaleString()}</p>
            <p className="text-sm text-gray-600">Property purchases</p>
        </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{getTotalRevenue().toLocaleString()}</p>
            <p className="text-sm text-green-600">Property sales</p>
        </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`text-sm ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalProfit() >= 0 ? '+' : ''}{getTotalInvestment() > 0 ? Math.round(((getTotalProfit() / getTotalInvestment()) * 100)) : 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Net Profit</h3>
            <p className={`text-3xl font-medium mb-1 ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{getTotalProfit().toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total return</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-orange-600">Pending</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Amount Pending</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">₹{getTotalPending().toLocaleString()}</p>
            <p className="text-sm text-orange-600">Outstanding</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {propertyAnalytics && (
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Analytics & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partner Analytics Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900 mb-6">📊 Partner-wise Transaction Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(propertyAnalytics).map(([partner, data]: [string, any]) => ({
                partner,
                investment: data.totalInvestment,
                revenue: data.totalRevenue,
                profit: data.profit
              }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="partner" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                <Legend />
                  <Bar dataKey="investment" fill="#EF4444" name="Investment" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Property Type Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900 mb-6">🏠 Property Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                      { name: 'Buy', value: getBuyProperties() },
                      { name: 'Sell', value: getSellProperties() }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#10B981" />
                </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} properties`, '']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by partner, seller, or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'buy' | 'sell')}
                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy Only</option>
                <option value="sell">Sell Only</option>
              </select>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
      </div>

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium text-gray-900">Property Records ({filteredProperties.length})</h2>
          <div className="text-sm text-gray-500">
            Total deals: {properties.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        property.propertyType === 'buy' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {property.propertyType === 'buy' ? '🏠 BUY' : '💰 SELL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-medium text-sm">
                            {property.partnerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                      <div className="text-sm font-medium text-gray-900">{property.partnerName}</div>
                      <div className="text-sm text-gray-500">
                        {property.propertyType === 'buy' 
                              ? `From: ${property.sellerName || 'N/A'}`
                              : `To: ${property.buyerName || 'N/A'}`
                        }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.area} {property.areaUnit}</div>
                      <div className="text-sm text-gray-500">₹{property.ratePerUnit.toLocaleString()}/{property.areaUnit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{property.totalCost.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₹{property.amountPaid.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">₹{property.amountPending.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                      <button
                        onClick={() => editProperty(property)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProperty(property._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {properties.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No properties yet</p>
                <p className="text-gray-400 text-sm mb-4">Start by adding your first property deal</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border-0 w-[700px] shadow-2xl rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </h3>
                <button
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Property Type Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">🏢 Property Type</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
                    <select
                      required
                      value={form.propertyType}
                      onChange={(e) => setForm(prev => ({ ...prev, propertyType: e.target.value as 'buy' | 'sell' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="buy">🟢 Buy Property</option>
                      <option value="sell">🔴 Sell Property</option>
                    </select>
                  </div>
                </div>

                {/* Property Details Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">📐 Property Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={form.area}
                        onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area Unit *</label>
                      <select
                        value={form.areaUnit}
                        onChange={(e) => setForm(prev => ({ ...prev, areaUnit: e.target.value as 'Bigha' | 'Gaj' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Bigha">🏞️ Bigha</option>
                        <option value="Gaj">📏 Gaj</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Partner Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">🤝 Partner Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter partner name"
                      value={form.partnerName}
                      onChange={(e) => setForm(prev => ({ ...prev, partnerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Transaction Party Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {form.propertyType === 'buy' ? '👤 Seller Information' : '👤 Buyer Information'}
                  </h4>
                  {form.propertyType === 'buy' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seller Name</label>
                      <input
                        type="text"
                        placeholder="Enter seller name"
                        value={form.sellerName}
                        onChange={(e) => setForm(prev => ({ ...prev, sellerName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                  {form.propertyType === 'sell' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
                      <input
                        type="text"
                        placeholder="Enter buyer name"
                        value={form.buyerName}
                        onChange={(e) => setForm(prev => ({ ...prev, buyerName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                </div>

                {/* Financial Details Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">💰 Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate per {form.areaUnit} *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.ratePerUnit}
                          onChange={(e) => setForm(prev => ({ ...prev, ratePerUnit: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
                          value={form.totalCost}
                          onChange={(e) => setForm(prev => ({ ...prev, totalCost: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.amountPaid}
                          onChange={(e) => setForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount Pending *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.amountPending}
                          onChange={(e) => setForm(prev => ({ ...prev, amountPending: e.target.value }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Date Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">📅 Transaction Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date *</label>
                    <input
                      type="date"
                      required
                      value={form.transactionDate}
                      onChange={(e) => setForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">📝 Additional Notes</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      placeholder="Add any additional notes..."
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingProperty ? '🔄 Update Property' : '🏢 Add Property'}
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

export default RealEstate 