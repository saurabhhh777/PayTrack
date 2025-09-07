import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: any) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          })
          throw error
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', { username, email, password })
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state: any) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
) 