"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import axiosInstance from '@/lib/axios'

type DashboardOverview = {
  total_projects: number
  total_users: number
  total_tasks: number
  task_status_counts: {
    todo: number
    in_progress: number
    done: number
  }
  completion_rate: number
}

type DetailedProject = {
  id: number
  name: string
  description: string
  tasks: {
    id: number
    title: string
    status: string
    coins: number
    user_id: number
  }[]
}

type UserSummary = {
  id: number
  name: string
  email: string
  coins: number
  tasks_count: number
}

const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await axiosInstance.get('/dashboard/overview')
  return response.data
}

const fetchDetailedProjects = async (): Promise<DetailedProject[]> => {
  const response = await axiosInstance.get('/dashboard/detailed_projects')
  return response.data
}

const fetchUsersSummary = async (): Promise<UserSummary[]> => {
  const response = await axiosInstance.get('/dashboard/users_summary')
  return response.data
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function Dashboard() {
  const { data: overview, isLoading: isOverviewLoading } = useQuery<DashboardOverview>({
    queryKey: ['dashboardOverview'],
    queryFn: fetchDashboardOverview,
  })

  const { data: detailedProjects, isLoading: isProjectsLoading } = useQuery<DetailedProject[]>({
    queryKey: ['detailedProjects'],
    queryFn: fetchDetailedProjects,
  })

  const { data: usersSummary, isLoading: isUsersSummaryLoading } = useQuery<UserSummary[]>({
    queryKey: ['usersSummary'],
    queryFn: fetchUsersSummary,
  })

  if (isOverviewLoading || isProjectsLoading || isUsersSummaryLoading) {
    return <div>Loading dashboard data...</div>
  }

  const taskStatusData = overview ? [
    { name: 'To Do', value: overview.task_status_counts.todo },
    { name: 'In Progress', value: overview.task_status_counts.in_progress },
    { name: 'Done', value: overview.task_status_counts.done },
  ] : []

  const projectTaskData = detailedProjects ? detailedProjects.map(project => ({
    name: project.name,
    tasks: project.tasks.length,
  })) : []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_projects}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_tasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.completion_rate.toFixed(1)}%</div>
                <Progress
                  value={overview?.completion_rate}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={{
                  todo: {
                    label: "To Do",
                    color: "hsl(var(--chart-1))",
                  },
                  in_progress: {
                    label: "In Progress",
                    color: "hsl(var(--chart-2))",
                  },
                  done: {
                    label: "Done",
                    color: "hsl(var(--chart-3))",
                  },
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={300}>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  You have {overview?.total_projects} total projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {detailedProjects?.slice(0, 5).map((project) => (
                    <div className="flex items-center" key={project.id}>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{project.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.tasks.length} tasks
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {project.tasks.filter(task => task.status === 'done').length} / {project.tasks.length}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects Overview</CardTitle>
              <CardDescription>
                Number of tasks per project
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{
                tasks: {
                  label: "Tasks",
                  color: "hsl(var(--chart-1))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTaskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tasks" fill="var(--color-tasks)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Summary</CardTitle>
              <CardDescription>
                Overview of user tasks and coins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {usersSummary?.map((user) => (
                  <div className="flex items-center" key={user.id}>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      {user.tasks_count} tasks | {user.coins} coins
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}