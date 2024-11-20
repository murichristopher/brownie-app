import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from './axios'

interface User {
  id: number
  email: string
  name: string
  profile_picture: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axiosInstance.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/login')
  }

  return { user, loading, login, logout }
}