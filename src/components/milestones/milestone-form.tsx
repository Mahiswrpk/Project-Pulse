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
import { milestoneSchema, type MilestoneFormData } from "@/validators/milestone.schema";
import { createMilestone, updateMilestone } from "@/actions/milestone.actions";
import { toast } from "@/components/ui/use-toast";
import type { Milestone } from "@/types";

interface MilestoneFormProps {
  projectId: string;
  milestone?: Milestone;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MilestoneForm({ projectId, milestone, onSuccess, onCancel }: MilestoneFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: milestone?.title ?? "",
      description: milestone?.description ?? "",
      status: milestone?.status ?? "PENDING",
      targetDate: milestone?.targetDate ? new Date(milestone.targetDate).toISOString().split("T")[0] : "",
      completionPercentage: milestone?.completionPercentage ?? 0,
    },
  });

  const onSubmit = async (data: MilestoneFormData) => {
    setLoading(true);
    try {
      const result = milestone
        ? await updateMilestone(milestone.id, data)
        : await createMilestone(projectId, data);
      if (result.success) {
        toast({ title: milestone ? "Milestone updated" : "Milestone created!" });
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
        <Label>Title *</Label>
        <Input placeholder="Milestone title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea placeholder="Milestone description..." rows={2} {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select defaultValue={watch("status")} onValueChange={(v) => setValue("status", v as MilestoneFormData["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["PENDING","Pending"],["IN_PROGRESS","In Progress"],["COMPLETED","Completed"],["MISSED","Missed"]].map(([v,l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Target Date</Label>
          <Input type="date" {...register("targetDate")} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.back())} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : milestone ? "Update" : "Create Milestone"}
        </Button>
      </div>
    </form>
  );
}
