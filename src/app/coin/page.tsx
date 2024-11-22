"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import axiosInstance from '@/lib/axios'
import { CoinsIcon } from 'lucide-react'

type User = {
  id: number
  email: string
  name: string
  profile_picture: string
  coins: number
}

type AXOValue = {
  date: string
  valueInReais: number
  valueInDollars: number
}

const fetchUserData = async (): Promise<User> => {
  const response = await axiosInstance.get('/users/me')
  return response.data
}

// Mock historical data for AXO value
const generateMockHistoricalData = (): AXOValue[] => {
  const data: AXOValue[] = []
  const baseValueReais = 0.10
  const baseValueDollars = 0.02
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const fluctuation = Math.random() * 0.02 - 0.01 // Random value between -0.01 and 0.01
    data.push({
      date: date.toISOString().split('T')[0],
      valueInReais: +(baseValueReais + baseValueReais * fluctuation).toFixed(4),
      valueInDollars: +(baseValueDollars + baseValueDollars * fluctuation).toFixed(4),
    })
  }
  return data
}

export default function CoinPage() {
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['userData'],
    queryFn: fetchUserData,
  })

  const historicalData = generateMockHistoricalData()
  const currentAXOValueReais = historicalData[historicalData.length - 1].valueInReais
  const currentAXOValueDollars = historicalData[historicalData.length - 1].valueInDollars

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AXO Coin</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your AXO Balance
            </CardTitle>
            <CoinsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{user?.coins} AXO</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Value in Reais (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                R$ {(user?.coins * currentAXOValueReais).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Value in Dollars ($)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                $ {(user?.coins * currentAXOValueDollars).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current AXO Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              1 AXO = R$ {currentAXOValueReais.toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              $ {currentAXOValueDollars.toFixed(4)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>AXO Value Evolution</CardTitle>
          <CardDescription>
            Historical value of AXO over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reais" className="space-y-4">
            <TabsList>
              <TabsTrigger value="reais">Reais (R$)</TabsTrigger>
              <TabsTrigger value="dollars">Dollars ($)</TabsTrigger>
            </TabsList>
            <TabsContent value="reais">
              <ChartContainer config={{
                valueInReais: {
                  label: "Value in Reais",
                  color: "hsl(var(--chart-1))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="valueInReais" stroke="var(--color-valueInReais)" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="dollars">
              <ChartContainer config={{
                valueInDollars: {
                  label: "Value in Dollars",
                  color: "hsl(var(--chart-2))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="valueInDollars" stroke="var(--color-valueInDollars)" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}