"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token)

      // Configure axios to use the token for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Redirect to the main page or dashboard
      router.push('/')

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
    } else if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      })
    }
  }, [searchParams, router, toast])

  return <>{children}</>
}