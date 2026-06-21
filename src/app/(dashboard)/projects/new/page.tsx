import { ProjectForm } from "@/components/projects/project-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Project" };

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Project</h1>
      <ProjectForm />
    </div>
  );
}
