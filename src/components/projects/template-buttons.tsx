"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createProjectFromTemplate } from "@/actions/template.actions";
import { toast } from "@/components/ui/use-toast";
import type { ProjectTemplate } from "@/types";

export function TemplateButtons({ templates }: { templates: ProjectTemplate[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleTemplate = async (id: string, name: string) => {
    setLoading(id);
    try {
      const result = await createProjectFromTemplate(id);
      if (result.success) {
        toast({ title: `Created from "${name}" template!` });
        router.push(`/projects/${result.data.id}`);
      }
    } catch (err) {
      toast({ title: "Failed", description: String(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {templates.slice(0, 5).map((t) => (
        <Button
          key={t.id}
          variant="outline"
          size="sm"
          disabled={loading === t.id}
          onClick={() => handleTemplate(t.id, t.name)}
        >
          {loading === t.id ? "Creating..." : t.name}
        </Button>
      ))}
    </div>
  );
}
