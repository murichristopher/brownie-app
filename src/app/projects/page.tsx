"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Link, Star, Edit, Trash, Plus } from 'lucide-react'
import axiosInstance from '@/lib/axios'

type Task = {
  id: number
  title: string
  status: "todo" | "in_progress" | "done"
  coins: number
  user_id: number
}

type Project = {
  id: number
  name: string
  description: string
  tasks: Task[]
}

const API_URL = '/projects'

const fetchProjects = async (): Promise<Project[]> => {
  const response = await axiosInstance.get(API_URL)
  return response.data
}

const createProject = async (newProject: Partial<Project>): Promise<Project> => {
  const response = await axiosInstance.post(API_URL, newProject)
  return response.data
}

const updateProject = async (updatedProject: Partial<Project>): Promise<Project> => {
  const response = await axiosInstance.put(`${API_URL}/${updatedProject.id}`, updatedProject)
  return response.data
}

const deleteProject = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`)
}

const createTask = async (projectId: number, newTask: Partial<Task>): Promise<Task> => {
  const response = await axiosInstance.post(`${API_URL}/${projectId}/tasks`, newTask)
  return response.data
}

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: "Project created successfully" })
      setIsCreateDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create project", description: error.message, variant: "destructive" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: "Project updated successfully" })
      setIsEditDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update project", description: error.message, variant: "destructive" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: "Project deleted successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete project", description: error.message, variant: "destructive" })
    }
  })

  const createTaskMutation = useMutation({
    mutationFn: ({ projectId, newTask }: { projectId: number; newTask: Partial<Task> }) =>
      createTask(projectId, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: "Task created successfully" })
      setIsCreateTaskDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" })
    }
  })

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newProject = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    }
    createMutation.mutate(newProject)
  }

  const handleUpdateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingProject) return
    const formData = new FormData(event.currentTarget)
    const updatedProject = {
      id: editingProject.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    }
    updateMutation.mutate(updatedProject)
  }

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProjectId) return
    const formData = new FormData(event.currentTarget)
    const newTask = {
      title: formData.get('title') as string,
      status: formData.get('status') as Task['status'],
      coins: Number(formData.get('coins')),
      user_id: 1, // Assuming a default user_id, you might want to implement user selection
    }
    createTaskMutation.mutate({ projectId: selectedProjectId, newTask })
  }

  if (isLoading) return <div>Loading projects...</div>
  if (isError) return <div>Error loading projects</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to your list.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input id="description" name="description" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <Card key={project.id} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  setEditingProject(project)
                  setIsEditDialogOpen(true)
                }}>
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(project.id)}>
                  <Trash className="h-5 w-5" />
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
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Tasks</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProjectId(project.id)
                      setIsCreateTaskDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>
                {project.tasks.length > 0 ? (
                  <ul className="space-y-1">
                    {project.tasks.map(task => (
                      <li key={task.id} className="text-sm">
                        {task.title} - <Badge variant="outline">{task.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Make changes to your project here.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingProject?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Input id="edit-description" name="description" defaultValue={editingProject?.description} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to the project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select name="status" defaultValue="todo">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coins" className="text-right">Coins</Label>
                <Input id="coins" name="coins" type="number" className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}