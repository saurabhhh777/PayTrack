import { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, Sprout, Building2 } from 'lucide-react'

interface DashboardData {
  summary: {
    totalExpenses: number
    totalIncome: number
    netProfit: number
    totalPending: number
    totalWorkers: number
    totalWorkingDays: number
    totalAbsentDays: number
  }
  paymentModes: {
    cash: number
    UPI: number
  }
  categoryTotals: {
    workers: any
    agriculture: any
    realEstate: any
  }
  timeSeriesData: Array<{
    date: string
    expenses: number
    income: number
    presentWorkers: number
    absentWorkers: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/dashboard', {
        params: dateRange
      })
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const paymentModeData = Object.entries(dashboardData.paymentModes).map(([mode, count]) => ({
    name: mode.toUpperCase(),
    value: count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your money, workers, agriculture, and real estate
          </p>
        </div>
        
        {/* Date Range Picker */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{dashboardData.summary.totalExpenses.toLocaleString()}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{dashboardData.summary.totalIncome.toLocaleString()}
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
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
                  <dd className={`text-lg font-medium ${dashboardData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{dashboardData.summary.netProfit.toLocaleString()}
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Workers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.summary.totalWorkers || 0}
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
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Working Days</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.summary.totalWorkingDays || 0}
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
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{dashboardData.summary.totalPending.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Statistics Cards */}


      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MMM/yyyy')}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Modes Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Modes Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentModeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentModeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} payments`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Worker Attendance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Worker Attendance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd/MMM')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MMM/yyyy')}
                formatter={(value: number) => [`${value} workers`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="presentWorkers" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Present"
              />
              <Line 
                type="monotone" 
                dataKey="absentWorkers" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Absent"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workers */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Workers</h4>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ₹{dashboardData.categoryTotals.workers.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {dashboardData.categoryTotals.workers.totalPayments} payments
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {dashboardData.categoryTotals.workers.totalWorkers} active • {dashboardData.categoryTotals.workers.totalWorkingDays} working days
            </p>
          </div>

          {/* Agriculture */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
              <Sprout className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Agriculture</h4>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ₹{dashboardData.categoryTotals.agriculture.profit.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {dashboardData.categoryTotals.agriculture.totalCultivations} cultivations
            </p>
          </div>

          {/* Real Estate */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Real Estate</h4>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ₹{dashboardData.categoryTotals.realEstate.profit.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {dashboardData.categoryTotals.realEstate.totalProperties} properties
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 