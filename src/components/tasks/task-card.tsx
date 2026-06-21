"use client";
import { useState } from "react";
import { Clock, Calendar, MoreVertical, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { TaskForm } from "./task-form";
import { deleteTask, updateTask } from "@/actions/task.actions";
import { toast } from "@/components/ui/use-toast";
import { formatDate, isOverdue } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task & { project?: { title: string; id: string } };
  showProject?: boolean;
}

export function TaskCard({ task, showProject }: TaskCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const overdue = task.status !== "DONE" && isOverdue(task.dueDate);

  const handleDelete = async () => {
    await deleteTask(task.id);
    toast({ title: "Task deleted" });
    router.refresh();
  };

  const handleComplete = async () => {
    await updateTask(task.id, { ...task, status: "DONE", dueDate: task.dueDate?.toISOString().split("T")[0] ?? undefined });
    toast({ title: "Task completed! ✓" });
    router.refresh();
  };

  return (
    <>
      <div className={`rounded-lg border p-3 hover:shadow-sm transition-shadow group ${task.status === "DONE" ? "opacity-70" : ""}`}>
        <div className="flex items-start gap-2">
          <button onClick={handleComplete} disabled={task.status === "DONE"} className={`mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === "DONE" ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/40 hover:border-primary"}`}>
            {task.status === "DONE" && <CheckCircle2 className="h-3 w-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className={`text-sm font-medium leading-snug ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteDialog title="Delete Task" description={`Delete "${task.title}"?`} onDelete={handleDelete}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />Delete
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {showProject && task.project && (
              <p className="text-xs text-muted-foreground mt-0.5">{task.project.title}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.estimatedHours && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />{task.estimatedHours}h
                </span>
              )}
              {task.dueDate && (
                <span className={`text-xs flex items-center gap-0.5 ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3" />{formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <TaskForm
            projectId={task.projectId}
            task={task}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
