"use client"

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Coins, Clock } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import axiosInstance from '@/lib/axios'
import { TaskDetailsModal } from './task-details-modal'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

type Task = {
  id: number
  title: string
  status: "todo" | "in_progress" | "done"
  coins: number
  user: User
  priority: "high" | "medium" | "low"
  due_date: string
  created_at: string
  project: {
    id: number
    name: string
    description: string
  },
  description: string
}

type User = {
  id: number
  name: string
  email: string
  profile_picture: string | null
}

type Column = {
  id: "todo" | "in_progress" | "done"
  title: string
}

const columns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
]

const updateTask = async (projectId: number, updatedTask: Partial<Task>): Promise<Task> => {
  const response = await axiosInstance.put(`/projects/${projectId}/tasks/${updatedTask.id}`, updatedTask)
  return response.data
}

export function KanbanBoard({ tasks, projectId }: { tasks: Task[], projectId: number }) {
  const [localTasks, setLocalTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const updateMutation = useMutation({
    mutationFn: (updatedTask: Partial<Task>) => updateTask(projectId, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      toast({ title: "Task updated successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" })
    }
  })

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const taskId = parseInt(draggableId.split('-')[1])
    const task = localTasks.find(t => t.id === taskId)

    if (!task) {
      console.error(`Task with id ${taskId} not found`)
      return
    }

    const newStatus = destination.droppableId as Task['status']

    const updatedTasks = localTasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    )

    setLocalTasks(updatedTasks)
    updateMutation.mutate({ id: taskId, status: newStatus })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString()
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

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {columns.map((column) => (
            <div key={column.id} className="flex-1 min-w-[300px] max-w-[400px] bg-secondary rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-lg">{column.title}</h3>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <ScrollArea
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`h-full ${snapshot.isDraggingOver ? 'bg-accent' : ''}`}
                  >
                    {localTasks
                      .filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-4 ${snapshot.isDragging ? 'opacity-50' : ''} cursor-pointer hover:shadow-md transition-shadow duration-200`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between mb-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.user.profile_picture || ''} alt={task.user.name} />
                                    <AvatarFallback>{task.user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-4 w-4" />
                                    <span className="text-sm">{task.coins} AXO</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mb-2">
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
                                  <span className="text-xs text-muted-foreground">
                                    Due: {formatDate(task.due_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTaskDuration(task)}</span>
                                </div>
                                <Progress value={getProgressPercentage(task)} className="mt-2" />
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </ScrollArea>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <TaskDetailsModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}