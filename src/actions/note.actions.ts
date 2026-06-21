"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { noteSchema } from "@/validators/note.schema";
import { logActivity } from "./activity.actions";

export async function getNotes(params?: { projectId?: string; search?: string; page?: number; perPage?: number }) {
  const user = await requireAuthUser();
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const skip = (page - 1) * perPage;

  const where = {
    userId: user.id,
    ...(params?.projectId ? { projectId: params.projectId } : {}),
    ...(params?.search ? {
      OR: [
        { title: { contains: params.search, mode: "insensitive" as const } },
        { content: { contains: params.search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: perPage,
      include: { project: { select: { title: true, id: true } } },
    }),
    prisma.note.count({ where }),
  ]);

  return { notes, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getNote(id: string) {
  const user = await requireAuthUser();
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    include: { project: { select: { title: true, id: true } } },
  });
  if (!note) throw new Error("Note not found");
  return note;
}

export async function createNote(projectId: string, data: unknown) {
  const user = await requireAuthUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");

  const validated = noteSchema.parse(data);
  const note = await prisma.note.create({
    data: { projectId, userId: user.id, title: validated.title, content: validated.content },
  });

  await logActivity({ action: "NOTE_CREATED", description: `Added note "${note.title}"`, projectId, noteId: note.id });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/notes");
  return { success: true, data: note };
}

export async function updateNote(id: string, data: unknown) {
  const user = await requireAuthUser();
  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Note not found");

  const validated = noteSchema.parse(data);
  const note = await prisma.note.update({ where: { id }, data: { title: validated.title, content: validated.content } });

  await logActivity({ action: "NOTE_UPDATED", description: `Updated note "${note.title}"`, projectId: note.projectId, noteId: note.id });
  revalidatePath(`/projects/${note.projectId}`);
  revalidatePath("/notes");
  return { success: true, data: note };
}

export async function deleteNote(id: string) {
  const user = await requireAuthUser();
  const note = await prisma.note.findFirst({ where: { id, userId: user.id } });
  if (!note) throw new Error("Note not found");

  await logActivity({ action: "NOTE_DELETED", description: `Deleted note "${note.title}"`, projectId: note.projectId });
  await prisma.note.delete({ where: { id } });

  revalidatePath(`/projects/${note.projectId}`);
  revalidatePath("/notes");
  return { success: true };
}
