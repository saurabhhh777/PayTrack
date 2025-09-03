import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { User, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  user: any
}

const Header = ({ user }: HeaderProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden lg:block">{user?.username}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.username}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 