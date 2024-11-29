import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, Clock, Calendar, Briefcase, AlertTriangle } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
  project: {
    id: number
    name: string
    description: string
  }
}

type TaskDetailsModalProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
  if (!task) return null

  console.log(task)

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.user.profile_picture || ''} alt={task.user.name} />
                  <AvatarFallback>{task.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{task.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{task.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${getPriorityColor(task.priority)}`} />
                  <span className="capitalize">{task.priority} Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{getTaskDuration(task)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getProgressPercentage(task)}% Complete
              </span>
            </div>
            <Progress value={getProgressPercentage(task)} className="h-2" />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Project Details</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">{task.project.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{task.project.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}