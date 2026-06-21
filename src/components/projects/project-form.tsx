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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectSchema, type ProjectFormData } from "@/validators/project.schema";
import { createProject, updateProject } from "@/actions/project.actions";
import { toast } from "@/components/ui/use-toast";
import type { Project } from "@/types";

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      status: project?.status ?? "PLANNING",
      priority: project?.priority ?? "MEDIUM",
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const result = project
        ? await updateProject(project.id, data)
        : await createProject(data);
      if (result.success) {
        toast({ title: project ? "Project updated" : "Project created!", description: `"${data.title}" saved successfully.` });
        if (onSuccess) { onSuccess(); }
        else { router.push(project ? `/projects/${project.id}` : "/projects"); }
      }
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{project ? "Edit Project" : "New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Project title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="What is this project about?" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue={watch("status")} onValueChange={(v) => setValue("status", v as ProjectFormData["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"].map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select defaultValue={watch("priority")} onValueChange={(v) => setValue("priority", v as ProjectFormData["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                    <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
            )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
