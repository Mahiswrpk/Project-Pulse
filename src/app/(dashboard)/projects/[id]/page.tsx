import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TaskCard } from "@/components/tasks/task-card";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { getProject } from "@/actions/project.actions";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const p = await getProject(params.id);
    return { title: p.title };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  let project;
  try {
    project = await getProject(params.id);
  } catch {
    notFound();
  }

  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const completedMs = project.milestones.filter((m) => m.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold break-words">{project.title}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {project.startDate && (
              <span className="text-xs text-muted-foreground">
                Started: {formatDate(project.startDate)}
              </span>
            )}
            {project.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due: {formatDate(project.dueDate)}
              </span>
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/projects/${project.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <ProgressBar value={project.completionPercentage} />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tasks", value: `${doneTasks}/${project.tasks.length}` },
          { label: "Milestones", value: `${completedMs}/${project.milestones.length}` },
          { label: "Notes", value: String(project.notes.length) },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs (client component for dialogs) */}
      <ProjectTabs project={project} />
    </div>
  );
}
