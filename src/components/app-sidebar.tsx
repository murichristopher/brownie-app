"use client"

import * as React from "react"
import { FolderKanban, ListTodo, Moon, Settings2, Sun } from 'lucide-react'
import { useTheme } from "next-themes"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from '@/lib/useAuth'

const data = {
  teams: [
    {
      name: "Axolutions",
      logo: FolderKanban,
      plan: "Empresa",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
      items: [
        {
          title: "All Projects",
          url: "/projects",
        },
        {
          title: "Create New Project",
          url: "/projects",
        },
      ],
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: ListTodo,
      items: [
        {
          title: "My Tasks",
          url: "/my-tasks",
        },
        {
          title: "Create New Task",
          url: "/my-tasks",
        },
      ],
    },
    {
      title: "AxoCoin",
      url: "/coin",
      icon: ListTodo,
      items: [
        {
          title: "Coin",
          url: "/coin",
        },
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        <NavUser user={{
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
          avatar: user?.profile_picture || '/placeholder.svg'
        }} />
        <Tooltip>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}