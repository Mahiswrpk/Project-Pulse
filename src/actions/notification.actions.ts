"use server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import type { NotificationType } from "@prisma/client";


export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityId?: string;
  entityType?: string;
}) {
  return prisma.notification.create({ data: params });
}

export async function getNotifications(page = 1, perPage = 20) {
  const user = await requireAuthUser();
  const skip = (page - 1) * perPage;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return { notifications, total, page, perPage, totalPages: Math.ceil(total / perPage), unreadCount };
}

export async function markAsRead(id: string) {
  const user = await requireAuthUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
  return { success: true };
}

export async function markAllAsRead() {
  const user = await requireAuthUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return { success: true };
}

export async function getUnreadCount() {
  const user = await requireAuthUser();
  return prisma.notification.count({ where: { userId: user.id, read: false } });
}

export async function deleteNotification(id: string) {
  const user = await requireAuthUser();
  await prisma.notification.deleteMany({ where: { id, userId: user.id } });
  return { success: true };
}

export async function updateNotificationPreferences(prefs: {
  emailTaskDue?: boolean;
  emailTaskOverdue?: boolean;
  emailMilestone?: boolean;
  emailProjectDeadline?: boolean;
  inAppTaskDue?: boolean;
  inAppTaskOverdue?: boolean;
  inAppMilestone?: boolean;
  inAppProjectDeadline?: boolean;
}) {
  const user = await requireAuthUser();
  const pref = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: prefs,
    create: { userId: user.id, ...prefs },
  });
  return { success: true, data: pref };
}

export async function getNotificationPreferences() {
  const user = await requireAuthUser();
  return prisma.notificationPreference.findUnique({ where: { userId: user.id } });
}
