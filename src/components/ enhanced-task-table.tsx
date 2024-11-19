"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreHorizontal, Edit, Trash, CheckCircle } from 'lucide-react'

type Task = {
  id: number
  name: string
  status: "Not Started" | "In Progress" | "Completed"
  dueDate: string
  assignee: {
    name: string
    avatar: string
  }
}

const tasks: Task[] = [
  {
    id: 1,
    name: "Design new landing page",
    status: "In Progress",
    dueDate: "2023-06-30",
    assignee: { name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" }
  },
  {
    id: 2,
    name: "Implement user authentication",
    status: "Completed",
    dueDate: "2023-06-15",
    assignee: { name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" }
  },
  {
    id: 3,
    name: "Optimize database queries",
    status: "Not Started",
    dueDate: "2023-07-05",
    assignee: { name: "Charlie Brown", avatar: "/placeholder.svg?height=32&width=32" }
  },
  {
    id: 4,
    name: "Write API documentation",
    status: "In Progress",
    dueDate: "2023-07-10",
    assignee: { name: "Diana Prince", avatar: "/placeholder.svg?height=32&width=32" }
  },
  {
    id: 5,
    name: "Set up CI/CD pipeline",
    status: "Not Started",
    dueDate: "2023-07-20",
    assignee: { name: "Ethan Hunt", avatar: "/placeholder.svg?height=32&width=32" }
  },
]

export default function EnhancedTaskTable() {
  return (
    <Table>

      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Task</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Due Date</TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                  <AvatarFallback>{task.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {task.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{task.dueDate}</TableCell>
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
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Mark as Complete</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}