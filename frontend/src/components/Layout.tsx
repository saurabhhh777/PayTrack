import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-72">
        <Header user={user} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 