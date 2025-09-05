import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { useAuthStore } from '../stores/authStore'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Sprout, 
  Building2,
  ExternalLink,
  Clock
} from 'lucide-react'

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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  const { user } = useAuthStore()

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

  // Mock recent activity data
  const recentActivities = [
    { id: 1, name: "Ramesh Kumar", type: "Payment", amount: "₹2,500", date: "Today", status: "Paid", category: "Worker" },
    { id: 2, name: "Wheat Cultivation", type: "Expense", amount: "₹15,000", date: "Yesterday", status: "Pending", category: "Agriculture" },
    { id: 3, name: "Priya Singh", type: "Payment", amount: "₹3,200", date: "2 days ago", status: "Paid", category: "Worker" },
    { id: 4, name: "Property Rent", type: "Income", amount: "₹25,000", date: "3 days ago", status: "Received", category: "Real Estate" },
    { id: 5, name: "Suresh Patel", type: "Payment", amount: "₹2,800", date: "4 days ago", status: "Paid", category: "Worker" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      </div>
    )
  }

  // Prepare chart data for payment trends
  const paymentTrends = dashboardData.timeSeriesData.slice(-7).map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    received: item.income,
    pending: item.expenses - item.income
  }))

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-medium mb-4">Welcome back, {user?.username}!</h1>
          <p className="text-xl text-green-100 mb-6">
            Here's what's happening with your operations today
          </p>
          
          {/* Date Range Picker */}
          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 w-fit">
            <Calendar className="h-5 w-5 text-white" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-transparent text-white placeholder-green-200 border-none focus:outline-none text-sm"
            />
            <span className="text-green-200">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-transparent text-white placeholder-green-200 border-none focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-8">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Cultivation Area */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cultivation Area</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">
              {dashboardData.categoryTotals.agriculture?.totalCultivations || 0} fields
            </p>
            <p className="text-sm text-green-600">+2 this month</p>
          </div>

          {/* Total Payments Received */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Income</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">
              ₹{dashboardData.summary.totalIncome.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">+8% from last month</p>
          </div>

          {/* Pending Amounts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Amount</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">
              ₹{dashboardData.summary.totalPending.toLocaleString()}
            </p>
            <p className="text-sm text-red-600">-12% from last month</p>
          </div>

          {/* Active Workers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Workers</h3>
            <p className="text-3xl font-medium text-gray-900 mb-1">
              {dashboardData.summary.totalWorkers || 0}
            </p>
            <p className="text-sm text-green-600">+3 this month</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-gray-900">Recent Activity</h3>
                <Link to="/payments" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.category === 'Worker' ? 'bg-purple-100' :
                        activity.category === 'Agriculture' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.category === 'Worker' && <Users className="h-5 w-5 text-purple-600" />}
                        {activity.category === 'Agriculture' && <Sprout className="h-5 w-5 text-green-600" />}
                        {activity.category === 'Real Estate' && <Building2 className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.name}</p>
                        <p className="text-sm text-gray-500">{activity.type} • {activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{activity.amount}</p>
                      <p className={`text-sm font-medium ${
                        activity.status === 'Paid' || activity.status === 'Received' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {activity.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Trends Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Payment Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Bar 
                  dataKey="received" 
                  fill="#10B981" 
                  name="Received"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="pending" 
                  fill="#F59E0B" 
                  name="Pending"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MMM/yyyy')}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Income"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Expenses"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Worker Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Worker Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd/MMM')}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MMM/yyyy')}
                formatter={(value: number) => [`${value} workers`, '']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="presentWorkers" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Present"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="absentWorkers" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Absent"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 