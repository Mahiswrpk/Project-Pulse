import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  content: z.string().min(1, "Content is required").max(100000, "Content too long"),
});

export type NoteFormData = z.infer<typeof noteSchema>;
