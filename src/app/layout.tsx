"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"


import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CoinsIcon, Bell, Settings, LogOut, ChevronDown } from 'lucide-react'
import EnhancedTaskTable from "@/components/enhanced-task-table"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axiosInstance from '@/lib/axios'

import { Toaster } from "@/components/ui/toaster"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading user data</div>

  return (
    <Card className="bg-background mb-1.5">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture} alt={user.email} />
            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <CoinsIcon className="mr-1 h-4 w-4" />
              <Badge variant="secondary" className="rounded-full px-2 py-0.5">
                {user.coins} coins
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
