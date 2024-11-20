"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code || !state) {
        toast({
          title: "Authentication Failed",
          description: "Missing required parameters",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      try {
        const response = await axios.get(`http://localhost:4000/users/auth/google_oauth2/callback`, {
          params: { code, state }
        })

        const { token, user } = response.data

        // Store the token and user info in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Configure axios to use the token for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        })

        // Redirect to the main page or dashboard
        router.push('/')
      } catch (error) {
        console.error('Authentication error:', error)
        toast({
          title: "Authentication Failed",
          description: "An error occurred during authentication. Please try again.",
          variant: "destructive",
        })
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, searchParams, toast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}