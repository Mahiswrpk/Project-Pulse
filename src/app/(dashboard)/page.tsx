import Link from "next/link";
import { FolderKanban, CheckSquare, AlertTriangle, Milestone, TrendingUp, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats } from "@/actions/project.actions";
import { ImportModal } from "@/components/import/import-modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelative, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const ACTION_LABELS: Record<string, string> = {
  PROJECT_CREATED: "Created project",
  PROJECT_UPDATED: "Updated project",
  PROJECT_COMPLETED: "Completed project",
  PROJECT_DELETED: "Deleted project",
  TASK_CREATED: "Created task",
  TASK_UPDATED: "Updated task",
  TASK_COMPLETED: "Completed task",
  TASK_DELETED: "Deleted task",
  MILESTONE_CREATED: "Created milestone",
  MILESTONE_COMPLETED: "Completed milestone",
  MILESTONE_UPDATED: "Updated milestone",
  MILESTONE_DELETED: "Deleted milestone",
  NOTE_CREATED: "Added note",
  NOTE_UPDATED: "Updated note",
  NOTE_DELETED: "Deleted note",
  IMPORT_COMPLETED: "Import completed",
};

export default async function DashboardPage() {
  const { stats, recentActivity, projectProgress } = await getDashboardStats();

  const statCards = [
    { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", href: "/projects" },
    { label: "Active Projects", value: stats.activeProjects, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", href: "/projects?status=ACTIVE" },
    { label: "Tasks Due Today", value: stats.tasksDueToday, icon: Clock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", href: "/tasks" },
    { label: "Overdue Tasks", value: stats.overdueTasks, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", href: "/tasks" },
    { label: "Total Tasks", value: stats.totalTasks, icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", href: "/tasks" },
    { label: "Upcoming Milestones", value: stats.upcomingMilestones, icon: Milestone, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", href: "/milestones" },
  ];

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your project overview at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/projects/new"><Plus className="h-4 w-4 mr-1" />New Project</Link>
          </Button>
          <ImportModal>
            <Button size="sm" className="gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Quick Import
            </Button>
          </ImportModal>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Task Completion</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{stats.completedTasks} of {stats.totalTasks} tasks done</p>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed Projects</span>
                <span className="font-medium">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-medium">{stats.activeProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Projects</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                <Link href="/projects">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectProgress.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active projects yet</p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href="/projects/new">Create your first project</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectProgress.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{p.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={p.status} />
                        <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(p.completionPercentage)}%</span>
                      </div>
                    </div>
                    <Progress value={p.completionPercentage} className="h-1.5" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7">
              <Link href="/activity">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start by creating a project!</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-1.5 border-b last:border-0">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-medium">
                      {log.action.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.description}</p>
                    {log.project && <p className="text-xs text-muted-foreground">{log.project.title}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
