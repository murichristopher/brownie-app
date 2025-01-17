"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, Clock, Calendar, AlertTriangle, Edit, Eye } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { useToast } from "@/components/ui/use-toast"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Task = {
  id: number
  title: string
  status: "todo" | "in_progress" | "done"
  coins: number
  user: {
    id: number
    name: string
    email: string
    profile_picture: string | null
  }
  priority: "high" | "medium" | "low"
  due_date: string
  created_at: string
  description: string
}

type TaskDetailsModalProps = {
  taskId: number | null
  isOpen: boolean
  onClose: () => void
}

const fetchTask = async (taskId: number): Promise<Task> => {
  const response = await axiosInstance.get(`/tasks/${taskId}`)
  return response.data
}

export function TaskDetailsModal({ taskId, isOpen, onClose }: TaskDetailsModalProps) {
  const [description, setDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { data: task, isLoading, isError } = useQuery<Task, Error>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTask(taskId!),
    enabled: !!taskId,
  })

  useEffect(() => {
    if (task) {
      setDescription(task.description || '')
    }
  }, [task])

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: Partial<Task>) =>
      axiosInstance.put(`/tasks/${taskId}`, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task description. Please try again.",
        variant: "destructive",
      })
    },
  })

  const saveDescription = useCallback(() => {
    if (task && description !== task.description) {
      return updateTaskMutation.mutateAsync({ id: task.id, description })
    }
    return Promise.resolve()
  }, [task, description, updateTaskMutation])

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setDescription(newDescription)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDescription()
    }, 2000) // Save after 2 seconds of inactivity
  }, [saveDescription])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveDescription().then(() => {
      onClose()
    })
  }, [saveDescription, onClose])

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading task</div>
  if (!task) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getTaskDuration = (task: Task) => {
    const start = new Date(task.created_at)
    const now = new Date()
    const durationMs = now.getTime() - start.getTime()
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  const getProgressPercentage = (task: Task) => {
    const start = new Date(task.created_at)
    const end = new Date(task.due_date)
    const now = new Date()
    const totalDuration = end.getTime() - start.getTime()
    const elapsedDuration = now.getTime() - start.getTime()
    return Math.min(Math.round((elapsedDuration / totalDuration) * 100), 100)
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                task.status === "done"
                  ? "default"
                  : task.status === "in_progress"
                    ? "secondary"
                    : "destructive"
              }
              className="text-sm px-2 py-1"
            >
              {task.status.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{task.coins} AXO</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Task Description</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </div>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Write your task description here..."
                className="h-[300px] resize-none"
              />
            ) : (
              <div className="border rounded-md p-4 h-[300px] overflow-y-auto prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    a: ({ node, href, ...props }) => (
                      <a
                        href={href}
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {description}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.user.profile_picture || ''} alt={task.user.name} />
                  <AvatarFallback>{task.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{task.user.name}</h3>
                  <p className="text-xs text-muted-foreground">{task.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${getPriorityColor(task.priority)}`} />
              <span className="capitalize text-sm">{task.priority} Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm">{formatDate(task.due_date)}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{getTaskDuration(task)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {getProgressPercentage(task)}% Complete
              </span>
            </div>
            <Progress value={getProgressPercentage(task)} className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

