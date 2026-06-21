import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";
import { getProject } from "@/actions/project.actions";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try { const p = await getProject(params.id); return { title: `Edit: ${p.title}` }; }
  catch { return { title: "Edit Project" }; }
}

export default async function EditProjectPage({ params }: PageProps) {
  let project;
  try { project = await getProject(params.id); }
  catch { notFound(); }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <ProjectForm project={project} />
    </div>
  );
}
