// app/projects/[projectId]/page.tsx
import ProjectTasks from '@/components/project-tasks'

export default function Page({ params }: { params: { projectId: string } }) {
  return <ProjectTasks projectId={parseInt(params.projectId, 10)} />
}