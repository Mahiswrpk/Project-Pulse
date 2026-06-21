"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { projectSchema } from "@/validators/project.schema";
import { logActivity } from "./activity.actions";
import type { ProjectStatus, Priority,Prisma } from "@prisma/client";
import { createNotification } from "./notification.actions";


export async function getProjects(params?: {
  status?: ProjectStatus;
  priority?: Priority;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const user = await requireAuthUser();
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 12;
  const skip = (page - 1) * perPage;

  const where = {
    userId: user.id,
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.priority ? { priority: params.priority } : {}),
    ...(params?.search
      ? {
          OR: [
            { title: { contains: params.search, mode: "insensitive" as const } },
            { description: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: perPage,
      include: {
        _count: { select: { tasks: true, milestones: true, notes: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProject(id: string) {
  const user = await requireAuthUser();
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      tasks: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: { tags: { include: { tag: true } } },
      },
      milestones: { orderBy: { targetDate: "asc" } },
      notes: { orderBy: { updatedAt: "desc" } },
      tags: { include: { tag: true } },
      _count: { select: { tasks: true, milestones: true, notes: true } },
    },
  });
  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(data: unknown) {
  const user = await requireAuthUser();
  const validated = projectSchema.parse(data);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      priority: validated.priority,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      //customFields: validated.customFields ?? null,
      customFields: validated.customFields as Prisma.InputJsonValue,
    },
  });

    await createNotification({
    userId: user.id,
    title: "Project Created",
    message: `"${project.title}" was created successfully`,
    type: "GENERAL",
    entityId: project.id,
    entityType: "project",
  });

  await logActivity({
    action: "PROJECT_CREATED",
    description: `Created project "${project.title}"`,
    projectId: project.id,
  });

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true, data: project };
}

export async function updateProject(id: string, data: unknown) {
  const user = await requireAuthUser();
  const existing = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) throw new Error("Project not found");

  const validated = projectSchema.parse(data);
  const isCompleted =
    validated.status === "COMPLETED" && existing.status !== "COMPLETED";

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      priority: validated.priority,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      customFields: validated.customFields as Prisma.InputJsonValue,
      //customFields: validated.customFields ?? null,
    },
  });

  await logActivity({
    action: isCompleted ? "PROJECT_COMPLETED" : "PROJECT_UPDATED",
    description: `${isCompleted ? "Completed" : "Updated"} project "${project.title}"`,
    projectId: project.id,
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, data: project };
}

export async function deleteProject(id: string) {
  const user = await requireAuthUser();
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) throw new Error("Project not found");

  await logActivity({
    action: "PROJECT_DELETED",
    description: `Deleted project "${project.title}"`,
  });
  await prisma.project.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}

export async function recalculateProjectProgress(
  projectId: string,
  userId: string
) {
  const [tasks, milestones] = await Promise.all([
    prisma.task.findMany({
      where: { projectId, userId },
      select: { status: true },
    }),
    prisma.milestone.findMany({
      where: { projectId, userId },
      select: { status: true },
    }),
  ]);

  const totalItems = tasks.length + milestones.length;
  if (totalItems === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { completionPercentage: 0 },
    });
    return 0;
  }

  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const percentage = Math.round(
    ((completedTasks + completedMilestones) / totalItems) * 100
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { completionPercentage: percentage },
  });
  return percentage;
}

export async function getDashboardStats() {
  const user = await requireAuthUser();
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    tasksDueToday,
    overdueTasks,
    upcomingMilestones,
    totalTasks,
    completedTasks,
    recentActivity,
    projectProgress,
  ] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.project.count({ where: { userId: user.id, status: "COMPLETED" } }),
    prisma.task.count({
      where: {
        userId: user.id,
        dueDate: { gte: todayStart, lte: todayEnd },
        status: { not: "DONE" },
      },
    }),
    prisma.task.count({
      where: {
        userId: user.id,
        dueDate: { lt: todayStart },
        status: { not: "DONE" },
      },
    }),
    prisma.milestone.count({
      where: {
        userId: user.id,
        targetDate: { gte: now, lte: sevenDaysFromNow },
        status: { not: "COMPLETED" },
      },
    }),
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, status: "DONE" } }),
    prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { project: { select: { title: true } } },
    }),
    prisma.project.findMany({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "PLANNING"] },
      },
      select: {
        id: true,
        title: true,
        completionPercentage: true,
        status: true,
        dueDate: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      tasksDueToday,
      overdueTasks,
      upcomingMilestones,
      totalTasks,
      completedTasks,
    },
    recentActivity,
    projectProgress,
  };
}
