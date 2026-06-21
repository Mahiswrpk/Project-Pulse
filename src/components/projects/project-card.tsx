"use client";
import Link from "next/link";
import { MoreVertical, Calendar, CheckSquare, Milestone, FileText, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { formatDate, isOverdue } from "@/lib/utils";
import { deleteProject } from "@/actions/project.actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project & { _count?: { tasks: number; milestones: number; notes: number } };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const overdue = isOverdue(project.dueDate);

  const handleDelete = async () => {
    await deleteProject(project.id);
    toast({ title: "Project deleted", description: `"${project.title}" has been deleted.` });
    router.refresh();
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteDialog
                title="Delete Project"
                description={`Delete "${project.title}" and all its tasks, milestones, and notes? This cannot be undone.`}
                onDelete={handleDelete}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />Delete
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <ProgressBar value={project.completionPercentage} size="sm" />

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            <span>{project._count?.tasks ?? 0} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Milestone className="h-3 w-3" />
            <span>{project._count?.milestones ?? 0} ms</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{project._count?.notes ?? 0} notes</span>
          </div>
        </div>

        {project.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            <span>{overdue ? "Overdue: " : "Due: "}{formatDate(project.dueDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
