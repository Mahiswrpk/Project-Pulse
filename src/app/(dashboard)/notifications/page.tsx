"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/actions/notification.actions";
import { formatRelative } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import type { Notification } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  TASK_DUE_TODAY: "⏰",
  TASK_OVERDUE: "🚨",
  MILESTONE_APPROACHING: "🎯",
  PROJECT_DEADLINE_APPROACHING: "📅",
  TASK_COMPLETED: "✅",
  MILESTONE_COMPLETED: "🏆",
  PROJECT_COMPLETED: "🎉",
  GENERAL: "📣",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await getNotifications(1, 50);
    setNotifications(result.notifications);
    setUnread(result.unreadCount);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    toast({ title: "All notifications marked as read" });
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          {unread > 0 && <p className="text-sm text-muted-foreground">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-1.5">
            <CheckCheck className="h-4 w-4" />Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`p-4 transition-colors ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{TYPE_ICONS[n.type] ?? "📣"}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
