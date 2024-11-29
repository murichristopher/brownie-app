"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { MoreHorizontal, Edit, Trash, CheckCircle, Coins } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/lib/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { KanbanBoard } from './kanban-board'
import { TaskDetailsModal } from './task-details-modal'

type Task = {
  id: number
  title: string
  status: "todo" | "in_progress" | "done"
  coins: number
  user: User
  priority: "high" | "medium" | "low"
  due_date: string
  created_at: string
  updated_at: string
  project_id: number
  project: {
    id: number
    name: string
    description: string
  }
}

type User = {
  id: number
  name: string
  email: string
  coins: number
  profile_picture: string | null
}

type Project = {
  id: number
  name: string
  description: string
}

const API_URL = '/projects'
const USERS_API_URL = '/users'

const fetchProjectTasks = async (projectId: number): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}/tasks`)
    return response.data
  } catch (error) {
    console.error('Error fetching project tasks:', error)
    throw new Error('Failed to fetch project tasks. Please try again later.')
  }
}

const fetchProject = async (projectId: number): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching project:', error)
    throw new Error('Failed to fetch project. Please try again later.')
  }
}

const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get(USERS_API_URL)
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users. Please try again later.')
  }
}

const createTask = async (projectId: number, newTask: Partial<Task>): Promise<Task> => {
  try {
    const response = await axiosInstance.post(`${API_URL}/${projectId}/tasks`, newTask)
    return response.data
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task. Please try again.')
  }
}

const updateTask = async (projectId: number, updatedTask: Partial<Task>): Promise<Task> => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${projectId}/tasks/${updatedTask.id}`, updatedTask)
    await axiosInstance.get('/users/me')
    return response.data
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task. Please try again.')
  }
}

const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${projectId}/tasks/${taskId}`)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task. Please try again.')
  }
}

export default function ProjectTasks({ projectId }: { projectId: number }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['projectTasks', projectId],
    queryFn: () => fetchProjectTasks(projectId),
  })

  const { data: project } = useQuery<Project, Error>({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
  })

  const { data: users } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const createMutation = useMutation({
    mutationFn: (newTask: Partial<Task>) => createTask(projectId, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      toast({ title: "Task created successfully" })
      setIsCreateDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (updatedTask: Partial<Task>) => updateTask(projectId, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['userData'] })
      toast({ title: "Task updated successfully" })
      setIsEditDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      toast({ title: "Task deleted successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete task", description: error.message, variant: "destructive" })
    }
  })

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newTask = {
      title: formData.get('title') as string,
      status: formData.get('status') as Task['status'],
      coins: Number(formData.get('coins')),
      user_id: Number(formData.get('user_id')),
      priority: formData.get('priority') as Task['priority'],
      due_date: formData.get('due_date') as string,
      project_id: projectId,
    }
    createMutation.mutate(newTask)
  }

  const handleUpdateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingTask) return
    const formData = new FormData(event.currentTarget)
    const updatedTask = {
      id: editingTask.id,
      title: formData.get('title') as string,
      status: formData.get('status') as Task['status'],
      coins: Number(formData.get('coins')),
      user_id: Number(formData.get('user_id')),
      priority: formData.get('priority') as Task['priority'],
      due_date: formData.get('due_date') as string,
      project_id: projectId,
    }
    updateMutation.mutate(updatedTask)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString()
  }

  const handleCompleteTask = (taskId: number) => {
    updateMutation.mutate(
      { id: taskId, status: 'done' },
      {
        onSuccess: () => {
          setCompletedTaskId(taskId)
          toast({
            title: "Task Completed!",
            description: "Great job! Keep up the good work! 👏",
            duration: 3000,
          })
          setTimeout(() => setCompletedTaskId(null), 1000)
          queryClient.invalidateQueries({ queryKey: ['userData'] })
        }
      }
    )
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleCloseTaskDetails = () => {
    setSelectedTask(null)
  }

  const completedTasks = tasks?.filter(task => task.status === 'done').length || 0
  const totalTasks = tasks?.length || 0

  if (isError) {
    return <div className="text-center text-red-500">Error: {error.message}</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{project?.name} Tasks</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to {project?.name}.</DialogDescription>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user_id" className="text-right">Assign To</Label>
                  <Select name="user_id" defaultValue={user?.id.toString()}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.profile_picture || ''} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="due_date" className="text-right">Due Date</Label>
                  <Input id="due_date" name="due_date" type="date" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    tasks?.map((task) => (
                      <motion.tr
                        key={task.id}
                        className={`${task.status === 'done' ? 'opacity-70' : ''} transition-all duration-300 cursor-pointer hover:bg-accent`}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          scale: completedTaskId === task.id ? [1, 1.05, 1] : 1,
                          backgroundColor: completedTaskId === task.id
                            ? ['hsl(var(--background))', 'hsl(var(--success))', 'hsl(var(--background))']
                            : 'hsl(var(--background))'
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "done"
                                ? "default"
                                : task.status === "in_progress"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            <span>{task.coins} AXO</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {users && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={users.find(u => u.id === task.user.id)?.profile_picture || ''} alt={`User ${task.user.id}`} />
                              <AvatarFallback>{task.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(task.due_date)}</TableCell>
                        <TableCell className="text-right">{formatDate(task.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                setEditingTask(task)
                                setIsEditDialogOpen(true)
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                handleCompleteTask(task.id)
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Mark as Complete</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                deleteMutation.mutate(task.id)
                              }}>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="kanban">
          {isLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-1 min-w-[300px]">
                  <Skeleton className="h-[500px] w-full" />
                </div>
              ))}
            </div>
          ) : tasks ? (
            <KanbanBoard tasks={tasks} projectId={projectId} />
          ) : null}
        </TabsContent>
      </Tabs>
      <div className="mt-4 text-sm text-gray-500">
        Total Tasks: {totalTasks} | Completed Tasks: {completedTasks}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">Title</Label>
                <Input id="edit-title" name="title" defaultValue={editingTask?.title} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select name="status" defaultValue={editingTask?.status}>
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
                <Label htmlFor="edit-coins" className="text-right">Coins</Label>
                <Input id="edit-coins" name="coins" type="number" defaultValue={editingTask?.coins} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user_id" className="text-right">Assign To</Label>
                <Select name="user_id" defaultValue={editingTask?.user.id.toString()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={user.profile_picture || ''} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-priority" className="text-right">Priority</Label>
                <Select name="priority" defaultValue={editingTask?.priority}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-due_date" className="text-right">Due Date</Label>
                <Input id="edit-due_date" name="due_date" type="date" defaultValue={editingTask?.due_date} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <TaskDetailsModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseTaskDetails}
      />
    </>
  )
}