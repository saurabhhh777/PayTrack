import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Sprout, 
  DollarSign, 
  ArrowRight, 
  Star,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Shield,
  BarChart3,
  FileText,
  Play
} from 'lucide-react'

const Home = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const features = [
    {
      icon: Users,
      title: "Worker Management",
      description: "Track worker details, attendance, and payroll with comprehensive employee management system."
    },
    {
      icon: Sprout,
      title: "Cultivation Tracking",
      description: "Monitor crop cycles, expenses, and agricultural activities with detailed cultivation records."
    },
    {
      icon: DollarSign,
      title: "Payment Management",
      description: "Manage all financial transactions, expenses, and payments with automated calculations."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get detailed analytics and reports on workers, cultivation, and financial performance."
    }
  ]

  const workflowSteps = [
    {
      icon: Users,
      title: "Add Workers",
      description: "Register your workers with their details, roles, and contact information in seconds."
    },
    {
      icon: Sprout,
      title: "Track Operations",
      description: "Log cultivation activities, expenses, and monitor all agricultural operations."
    },
    {
      icon: DollarSign,
      title: "Manage Payments",
      description: "Track all payments, wages, and expenses with automated calculations and records."
    },
    {
      icon: FileText,
      title: "Generate Insights",
      description: "Get comprehensive reports and analytics for better decision making and growth."
    }
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Farm Owner, Maharashtra",
      quote: "PayTrack has simplified my farm management completely. I can track all my workers and cultivation expenses in one place.",
      rating: 5
    },
    {
      name: "Priya Singh",
      role: "Agricultural Business",
      quote: "The payment tracking feature is amazing. I never miss any worker payments and the reports help me understand my costs better.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Farm Manager, Gujarat",
      quote: "Easy to use interface and comprehensive tracking. PayTrack has made our farm operations much more organized.",
      rating: 5
    }
  ]

  const faqs = [
    {
      question: "How does PayTrack help manage farm operations?",
      answer: "PayTrack provides comprehensive tools to manage workers, track cultivation activities, record payments, and generate detailed reports. Everything is centralized in one easy-to-use platform."
    },
    {
      question: "Can I track multiple farms or properties?",
      answer: "Yes, PayTrack supports multiple properties and farms. You can organize your operations by different locations and track them separately or get combined reports."
    },
    {
      question: "Is my data secure with PayTrack?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect your data. Your information is stored securely and is accessible only to authorized users."
    },
    {
      question: "Can I export reports and data?",
      answer: "Yes, PayTrack allows you to export various reports in different formats like PDF and Excel. You can generate custom reports based on your specific needs."
    },
    {
      question: "Do I need technical knowledge to use PayTrack?",
      answer: "Not at all! PayTrack is designed to be user-friendly with an intuitive interface. Most users can start using it immediately without any technical training."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-medium text-gray-900">PayTrack</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-12">
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About us</a>
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Services
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Features
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Reviews</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Blog</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contacts</a>
            </nav>

            {/* CTA Button */}
            <Link
              to="/dashboard"
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Start →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Large background circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-green-200/40 to-green-300/20 rounded-full blur-3xl"></div>
          
          {/* Medium circles */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-300/30 to-green-400/15 rounded-full blur-2xl"></div>
          
          {/* Inner circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-green-400/25 to-green-500/10 rounded-full blur-xl"></div>
          
          {/* Core circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-green-500/20 to-green-600/5 rounded-full"></div>
        </div>

        {/* Side Icons */}
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="absolute right-20 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Shield className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-7xl font-medium text-gray-900 mb-8 leading-tight">
            Technology, support, growth
            <br />
            <span className="text-gray-700">— all in one window</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            We help businesses receive grants, create products,
            <br />
            and enter the market.
          </p>

          {/* CTA Button */}
          <button className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
            Get a consultation
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-6">
              Everything you need to
              <br />
              manage your operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful tools designed to simplify your daily operations and boost productivity
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                      <feature.icon className="h-8 w-8 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-8">
                Why choose
                <br />
                PayTrack?
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                PayTrack was born from the real needs of farmers and agricultural businesses who struggled with managing workers, tracking cultivation expenses, and maintaining financial records.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Simple & Intuitive</h3>
                    <p className="text-gray-600 leading-relaxed">Designed for ease of use, no technical expertise required.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Reliable & Secure</h3>
                    <p className="text-gray-600 leading-relaxed">Your data is protected with industry-standard security measures.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Real-time Tracking</h3>
                    <p className="text-gray-600 leading-relaxed">Monitor all activities and payments in real-time with instant updates.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-medium text-gray-900 mb-2">1000+</div>
                    <div className="text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-medium text-gray-900 mb-2">5000+</div>
                    <div className="text-gray-600">Workers Managed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-medium text-gray-900 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-medium text-gray-900 mb-2">24/7</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-6">
              How PayTrack works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get started in just 4 simple steps and transform your operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {workflowSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                    <step.icon className="h-10 w-10 text-gray-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-6">
              What our users say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Trusted by farmers and businesses across the country
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-medium text-gray-900 text-lg">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-6">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Everything you need to know about PayTrack
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-lg">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-medium text-gray-900 mb-6">
            Start managing smarter
            <br />
            with PayTrack today
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied users who have transformed their operations with PayTrack
          </p>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-full font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try PayTrack now
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="text-2xl font-medium text-gray-900">PayTrack</span>
              </div>
              <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                Smart expense & cultivation management for farmers, workers, and businesses. 
                Streamline your operations with our comprehensive platform.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a></li>
                <li><Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">+91 12345 67890</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">contact@paytrack.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Mumbai, India</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <p className="text-gray-500 mb-4 lg:mb-0">
                © 2025 PayTrack. All rights reserved.
              </p>
              <div className="flex space-x-8">
                <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home