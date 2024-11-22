"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/lib/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

type Task = {
  id: number
  title: string
  status: "todo" | "in_progress" | "done"
  coins: number
  user: User
  priority: "high" | "medium" | "low"
  due_date: string
  created_at: string
  project: Project | null
}

type User = {
  id: number
  name: string
  email: string
  coins: number
}

type Project = {
  id: number
  name: string
}

const API_URL = '/tasks/my_tasks'

const fetchMyTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get(API_URL)
  return response.data
}

const updateTask = async (updatedTask: Partial<Task>): Promise<Task> => {
  const response = await axiosInstance.put(`/tasks/${updatedTask.id}`, updatedTask)
  return response.data
}

const deleteTask = async (taskId: number): Promise<void> => {
  await axiosInstance.delete(`/tasks/${taskId}`)
}

export default function MyTasks() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const router = useRouter()

  const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
    queryKey: ['myTasks'],
    queryFn: fetchMyTasks,
  })

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      queryClient.invalidateQueries({ queryKey: ['userData'] })
      toast({ title: "Task updated successfully" })
      setIsEditDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      toast({ title: "Task deleted successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete task", description: error.message, variant: "destructive" })
    }
  })

  const handleUpdateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingTask) return
    const formData = new FormData(event.currentTarget)
    const updatedTask = {
      id: editingTask.id,
      title: formData.get('title') as string,
      status: formData.get('status') as Task['status'],
      coins: Number(formData.get('coins')),
      priority: formData.get('priority') as Task['priority'],
      due_date: formData.get('due_date') as string,
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

  const handleProjectClick = (projectId: number | null | undefined) => {
    if (projectId) {
      router.push(`/projects/${projectId}`)
    }
  }

  if (isError) {
    return <div className="text-center text-red-500">Error: {error.message}</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Project</TableHead>
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
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                tasks?.map((task) => (
                  <motion.tr
                    key={task.id}
                    className={`${task.status === 'done' ? 'opacity-70' : ''} transition-all duration-300`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      scale: completedTaskId === task.id ? [1, 1.05, 1] : 1,
                      backgroundColor: completedTaskId === task.id ? ['#ffffff', '#f0fff4', '#ffffff'] : '#ffffff'
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
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
                    <TableCell>
                      {task.project ? (
                        <Button
                          variant="link"
                          onClick={() => handleProjectClick(task?.project?.id)}
                        >
                          {task.project.name}
                        </Button>
                      ) : (
                        "No Project"
                      )}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => {
                            setEditingTask(task)
                            setIsEditDialogOpen(true)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Complete</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(task.id)}>
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
    </>
  )
}