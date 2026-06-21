"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUnreadCount } from "@/actions/notification.actions";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setUnread).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(setUnread).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
