import { Link } from 'react-router-dom'
import { Users, Sprout, DollarSign, Calendar, TrendingUp, User } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Users,
      title: "Worker Management",
      description: "Track workers, manage payroll, and monitor attendance with comprehensive employee records."
    },
    {
      icon: Calendar,
      title: "Attendance System", 
      description: "Monitor worker attendance and calculate working days automatically with real-time tracking."
    },
    {
      icon: Sprout,
      title: "Cultivation Tracking",
      description: "Monitor cultivation activities, track expenses, and manage farm operations efficiently."
    },
    {
      icon: DollarSign,
      title: "Payment Management",
      description: "Record payments, track expenses, and maintain comprehensive financial records seamlessly."
    }
  ]

  const navigationLinks = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Workers", href: "/workers", icon: Users },
    { name: "Agriculture", href: "/agriculture", icon: Sprout },
    { name: "Profile", href: "/profile", icon: User }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">PayTrack</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-xl hover:bg-blue-50"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-72 h-72 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                PayTrack
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
              Smart Expense & Cultivation Management at Your Fingertips
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline your business operations with our comprehensive management platform. 
              Track workers, manage agriculture, handle payments, and boost productivity all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 min-h-[60px] min-w-[200px]"
              >
                <TrendingUp className="h-6 w-6" />
                Go to Dashboard
              </Link>
              <Link
                to="/workers"
                className="bg-white hover:bg-gray-50 text-gray-900 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-3 min-h-[60px] min-w-[200px]"
              >
                <Users className="h-6 w-6" />
                Add Worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to simplify your daily operations and boost productivity across all areas of your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses that rely on PayTrack for their daily operations
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-blue-100 text-lg">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-100 text-lg">Workers Managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
                <div className="text-blue-100 text-lg">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold">PayTrack</span>
            </div>
            <p className="text-gray-400 mb-4 text-lg">
              © 2025 PayTrack. All rights reserved.
            </p>
            <p className="text-gray-500">
              Smart business management made simple and efficient
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home