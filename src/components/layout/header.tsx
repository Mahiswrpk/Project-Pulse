"use client";
import Link from "next/link";
import { Zap, Bell, Search } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/actions/notification.actions";

export function Header() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setUnread).catch(() => {});
  }, []);

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg">
          <Zap className="h-5 w-5 text-primary" />
          <span>ProjectPulse</span>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/search"><Search className="h-5 w-5" /></Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </Button>
      </div>
    </header>
  );
}
