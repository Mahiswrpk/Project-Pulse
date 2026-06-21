"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, LayoutDashboard, FolderKanban, CheckSquare, Milestone, FileText, Bell, Activity, Search, Settings, Upload } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Milestones", href: "/milestones", icon: Milestone },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Search", href: "/search", icon: Search },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            ProjectPulse
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Separator className="my-2" />
          <Link href="/import" onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border-2 border-dashed transition-colors",
              isActive("/import") ? "border-primary text-primary bg-primary/5" : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
            )}>
            <Upload className="h-4 w-4" />
            Quick Import
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <span className="text-sm text-muted-foreground">My Account</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
