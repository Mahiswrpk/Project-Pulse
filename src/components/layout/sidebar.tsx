"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Milestone,
  FileText, Bell, Activity, Search, Settings, Upload, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Milestones", href: "/milestones", icon: Milestone },
  { label: "Notes", href: "/notes", icon: FileText },
];

const secondaryItems = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">ProjectPulse</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {secondaryItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <Link href="/import"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-2 border-dashed",
            isActive("/import")
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
          )}>
          <Upload className="h-4 w-4 shrink-0" />
          Quick Import
        </Link>
      </ScrollArea>

      {/* User */}
      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-sm text-muted-foreground truncate">My Account</span>
        </div>
      </div>
    </aside>
  );
}
