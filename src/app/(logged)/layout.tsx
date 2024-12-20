"use client";

import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider"


import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppSidebar } from "@/components/app-sidebar"


import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from '@/lib/axios'

import { Toaster } from "@/components/ui/toaster"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import CoinBalance from "@/components/coin-balance";


type User = {
  id: number
  email: string
  profile_picture: string
  coins: number
}

const fetchUserData = async (): Promise<User> => {
  const response = await axiosInstance.get('/users/me')
  return response.data
}

function UserHeader() {
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['userData'],
    queryFn: fetchUserData,
  })

  if (isLoading) {
    return (
      <Card className="bg-background mb-1.5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="bg-background mb-1.5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="text-sm text-red-500">Error loading user data</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <CoinBalance user={user} />
  )
}

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <head />
      <body>

        <QueryClientProvider client={queryClient}>

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="sticky top-0 z-10 border-b bg-background">
                  <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center space-x-4">
                      <SidebarTrigger />
                      <Separator orientation="vertical" className="h-6" />
                      <DynamicBreadcrumb />
                    </div>
                    <UserHeader />
                  </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                  {children}
                  <Toaster />
                </main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
