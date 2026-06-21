"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskSchema, type TaskFormData } from "@/validators/task.schema";
import { createTask, updateTask } from "@/actions/task.actions";
import { toast } from "@/components/ui/use-toast";
import type { Task } from "@/types";

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ projectId, task, onSuccess, onCancel }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      estimatedHours: task?.estimatedHours ?? undefined,
      actualHours: task?.actualHours ?? undefined,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const result = task
        ? await updateTask(task.id, data)
        : await createTask(projectId, data);
      if (result.success) {
        toast({ title: task ? "Task updated" : "Task created!" });
        if (onSuccess) { onSuccess(); router.refresh(); }
        else { router.push(`/projects/${projectId}`); router.refresh(); }
      }
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task-title">Title *</Label>
        <Input id="task-title" placeholder="Task title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">Description</Label>
        <Textarea id="task-description" placeholder="Task details..." rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select defaultValue={watch("status")} onValueChange={(v) => setValue("status", v as TaskFormData["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["BACKLOG","Backlog"],["TODO","Todo"],["IN_PROGRESS","In Progress"],["BLOCKED","Blocked"],["REVIEW","Review"],["DONE","Done"]].map(([v,l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select defaultValue={watch("priority")} onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => (
                <SelectItem key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="estimatedHours">Est. Hours</Label>
          <Input id="estimatedHours" type="number" step="0.5" min="0" placeholder="0" {...register("estimatedHours", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
      </div>

      {task && (
        <div className="space-y-1.5">
          <Label htmlFor="actualHours">Actual Hours</Label>
          <Input id="actualHours" type="number" step="0.5" min="0" placeholder="0" {...register("actualHours", { valueAsNumber: true })} />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.back())} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
