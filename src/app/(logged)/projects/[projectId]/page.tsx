"use client";

import { useParams } from 'next/navigation'
import ProjectTasks from '@/components/project-tasks'

export default function ProjectPage() {
  const params = useParams()
  const projectId = typeof params.projectId === 'string' ? parseInt(params.projectId, 10) : null

  if (projectId === null) {
    return <div>Invalid project ID</div>
  }

  return <ProjectTasks projectId={projectId} />
}