"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link, Star } from 'lucide-react'
import axiosInstance from '@/lib/axios'

type Project = {
  id: number
  name: string
  description: string
  tasks: Array<{
    id: number
    title: string
    status: string
    coins: number
    user_id: number
  }>
}

const fetchProjects = async (): Promise<Project[]> => {
  const response = await axiosInstance.get('/projects')
  return response.data
}

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  if (isLoading) return <div>Loading projects...</div>
  if (isError) return <div>Error loading projects</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <Card key={project.id} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Link className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Star className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={project.name} />
                  <AvatarFallback>{project.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Created on {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}