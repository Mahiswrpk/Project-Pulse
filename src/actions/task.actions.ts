"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { taskSchema } from "@/validators/task.schema";
import { logActivity } from "./activity.actions";
import { recalculateProjectProgress } from "./project.actions";
import type { TaskStatus, Priority, Prisma } from "@prisma/client";

export async function getTasks(params?: {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const user = await requireAuthUser();
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const skip = (page - 1) * perPage;

  const where = {
    userId: user.id,
    ...(params?.projectId ? { projectId: params.projectId } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.priority ? { priority: params.priority } : {}),
    ...(params?.search ? {
      OR: [
        { title: { contains: params.search, mode: "insensitive" as const } },
        { description: { contains: params.search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      skip,
      take: perPage,
      include: { project: { select: { title: true, id: true } }, tags: { include: { tag: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getTask(id: string) {
  const user = await requireAuthUser();
  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    include: { project: { select: { title: true, id: true } }, tags: { include: { tag: true } } },
  });
  if (!task) throw new Error("Task not found");
  return task;
}

export async function createTask(projectId: string, data: unknown) {
  const user = await requireAuthUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");

  const validated = taskSchema.parse(data);
  const task = await prisma.task.create({
    data: {
      projectId,
      userId: user.id,
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      priority: validated.priority,
      estimatedHours: validated.estimatedHours ?? null,
      actualHours: validated.actualHours ?? null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      completedDate: validated.completedDate ? new Date(validated.completedDate) : null,
      //customFields: validated.customFields ?? null,
      customFields: validated.customFields as Prisma.InputJsonValue,
    },
  });

  await logActivity({ action: "TASK_CREATED", description: `Created task "${task.title}"`, projectId, taskId: task.id });
  await recalculateProjectProgress(projectId, user.id);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { success: true, data: task };
}

export async function updateTask(id: string, data: unknown) {
  const user = await requireAuthUser();
  const existing = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Task not found");

  const validated = taskSchema.parse(data);
  const isBeingCompleted = validated.status === "DONE" && existing.status !== "DONE";

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      priority: validated.priority,
      estimatedHours: validated.estimatedHours ?? null,
      actualHours: validated.actualHours ?? null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      completedDate: isBeingCompleted ? new Date() : (validated.completedDate ? new Date(validated.completedDate) : null),
      //customFields: validated.customFields ?? null,
      customFields: validated.customFields as Prisma.InputJsonValue,
    },
  });

  await logActivity({
    action: isBeingCompleted ? "TASK_COMPLETED" : "TASK_UPDATED",
    description: `${isBeingCompleted ? "Completed" : "Updated"} task "${task.title}"`,
    projectId: task.projectId,
    taskId: task.id,
  });
  await recalculateProjectProgress(task.projectId, user.id);

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { success: true, data: task };
}

export async function deleteTask(id: string) {
  const user = await requireAuthUser();
  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) throw new Error("Task not found");

  await logActivity({ action: "TASK_DELETED", description: `Deleted task "${task.title}"`, projectId: task.projectId });
  await prisma.task.delete({ where: { id } });
  await recalculateProjectProgress(task.projectId, user.id);

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { success: true };
}
