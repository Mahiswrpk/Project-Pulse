import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTaskDueEmail, sendOverdueEmail, sendMilestoneEmail } from "@/lib/resend";
import { formatDate } from "@/lib/utils";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);

  try {
    // Tasks due today
    const tasksDueToday = await prisma.task.findMany({
      where: { dueDate: { gte: todayStart, lte: todayEnd }, status: { not: "DONE" } },
      include: { user: { include: { notificationPreference: true } }, project: { select: { title: true } } },
    });

    for (const task of tasksDueToday) {
      const prefs = task.user.notificationPreference;
      if (prefs?.inAppTaskDue) {
        await prisma.notification.upsert({
          where: { id: `task-due-${task.id}-${todayStart.toISOString().split("T")[0]}` },
          update: {},
          create: {
            id: `task-due-${task.id}-${todayStart.toISOString().split("T")[0]}`,
            userId: task.userId,
            title: "Task Due Today",
            message: `"${task.title}" in ${task.project.title} is due today`,
            type: "TASK_DUE_TODAY",
            entityId: task.id,
            entityType: "task",
          },
        });
      }
      if (prefs?.emailTaskDue && task.user.email) {
        await sendTaskDueEmail(task.user.email, task.title, task.project.title, formatDate(task.dueDate));
      }
    }

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: { dueDate: { lt: todayStart }, status: { not: "DONE" } },
      include: { user: { include: { notificationPreference: true } }, project: { select: { title: true } } },
    });

    for (const task of overdueTasks) {
      const prefs = task.user.notificationPreference;
      if (prefs?.inAppTaskOverdue) {
        await prisma.notification.upsert({
          where: { id: `task-overdue-${task.id}-${todayStart.toISOString().split("T")[0]}` },
          update: {},
          create: {
            id: `task-overdue-${task.id}-${todayStart.toISOString().split("T")[0]}`,
            userId: task.userId,
            title: "Task Overdue",
            message: `"${task.title}" in ${task.project.title} is overdue`,
            type: "TASK_OVERDUE",
            entityId: task.id,
            entityType: "task",
          },
        });
      }
      if (prefs?.emailTaskOverdue && task.user.email) {
        await sendOverdueEmail(task.user.email, task.title, task.project.title, formatDate(task.dueDate));
      }
    }

    // Upcoming milestones (within 7 days)
    const upcomingMilestones = await prisma.milestone.findMany({
      where: { targetDate: { gte: now, lte: sevenDaysFromNow }, status: { not: "COMPLETED" } },
      include: { user: { include: { notificationPreference: true } }, project: { select: { title: true } } },
    });

    for (const ms of upcomingMilestones) {
      const prefs = ms.user.notificationPreference;
      if (prefs?.inAppMilestone) {
        await prisma.notification.upsert({
          where: { id: `ms-approaching-${ms.id}-${todayStart.toISOString().split("T")[0]}` },
          update: {},
          create: {
            id: `ms-approaching-${ms.id}-${todayStart.toISOString().split("T")[0]}`,
            userId: ms.userId,
            title: "Milestone Approaching",
            message: `"${ms.title}" in ${ms.project.title} is due ${formatDate(ms.targetDate)}`,
            type: "MILESTONE_APPROACHING",
            entityId: ms.id,
            entityType: "milestone",
          },
        });
      }
      if (prefs?.emailMilestone && ms.user.email) {
        await sendMilestoneEmail(ms.user.email, ms.title, ms.project.title, formatDate(ms.targetDate));
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        tasksDueToday: tasksDueToday.length,
        overdueTasks: overdueTasks.length,
        upcomingMilestones: upcomingMilestones.length,
      },
    });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
