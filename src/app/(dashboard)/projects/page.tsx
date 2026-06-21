import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import { Pagination } from "@/components/shared/pagination";
import { ImportModal } from "@/components/import/import-modal";
import { TemplateButtons } from "@/components/projects/template-buttons";
import { getProjects } from "@/actions/project.actions";
import { getTemplates } from "@/actions/template.actions";
import type { Metadata } from "next";
import type { ProjectStatus, Priority } from "@/types";
import { Upload } from "lucide-react";

export const metadata: Metadata = { title: "Projects" };

interface PageProps {
  searchParams: { status?: string; priority?: string; q?: string; page?: string };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const { projects, total, totalPages } = await getProjects({
    status: searchParams.status as ProjectStatus,
    priority: searchParams.priority as Priority,
    search: searchParams.q,
    page,
    perPage: 12,
  });

  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">
            {total} project{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ImportModal>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-4 w-4" /> Import
            </Button>
          </ImportModal>
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-2 flex-wrap">
        <input type="hidden" name="page" value="1" />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {["ACTIVE", "PLANNING", "PAUSED", "COMPLETED", "ARCHIVED"].map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={searchParams.priority ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Priorities</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="secondary" className="h-9">
          Filter
        </Button>
        {(searchParams.status || searchParams.priority) && (
          <Button asChild size="sm" variant="ghost" className="h-9">
            <Link href="/projects">Clear</Link>
          </Button>
        )}
      </form>

      {/* Empty state with templates */}
      {projects.length === 0 && !searchParams.status && !searchParams.priority && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center space-y-4">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">No projects yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create a project from scratch or start with a template
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/projects/new">Create New Project</Link>
            </Button>
          </div>
          {templates.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Or start from a template:</p>
              <TemplateButtons templates={templates} />
            </div>
          )}
        </div>
      )}

      {/* Projects grid */}
      {projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            perPage={12}
          />
        </>
      )}
    </div>
  );
}
