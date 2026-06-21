"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { noteSchema, type NoteFormData } from "@/validators/note.schema";
import { createNote, updateNote } from "@/actions/note.actions";
import { toast } from "@/components/ui/use-toast";
import type { Note } from "@/types";

interface NoteFormProps {
  projectId: string;
  note?: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NoteForm({ projectId, note, onSuccess, onCancel }: NoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: note?.title ?? "", content: note?.content ?? "" },
  });

  const onSubmit = async (data: NoteFormData) => {
    setLoading(true);
    try {
      const result = note ? await updateNote(note.id, data) : await createNote(projectId, data);
      if (result.success) {
        toast({ title: note ? "Note updated" : "Note saved!" });
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
        <Input placeholder="Note title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Content *</Label>
        <Textarea placeholder="Write your note here..." rows={8} className="font-mono text-sm" {...register("content")} />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.back())} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : note ? "Update Note" : "Save Note"}
        </Button>
      </div>
    </form>
  );
}
