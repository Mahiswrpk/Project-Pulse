"use client";
import { useState } from "react";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseImportText, executeImport } from "@/actions/import.actions";
import { ImportPreview } from "./import-preview";
import type { ImportPreview as ImportPreviewType } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const EXAMPLE_TEXT = `PROJECT
Title: Portfolio Website
Description: Personal portfolio and blog
Priority: High
Status: Active
DueDate: 2026-09-01

TASK
Title: Setup Next.js project
Description: Initialize with TypeScript and Tailwind
Priority: High
Status: Todo
EstimatedHours: 2

TASK
Title: Create homepage design
Description: Hero section, about, projects showcase
Priority: High
Status: Todo
EstimatedHours: 8

TASK
Title: Build project detail pages
Priority: Medium
Status: Backlog
EstimatedHours: 6

MILESTONE
Title: MVP Launch
TargetDate: 2026-08-01
Status: Pending

MILESTONE
Title: Full Launch
TargetDate: 2026-09-01

NOTE
Title: Tech Stack Decisions
Content: Using Next.js 14, Tailwind CSS, shadcn/ui, Vercel deployment. Domain purchased on Namecheap.`;

export function ImportModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "importing" | "done">("input");
  const [preview, setPreview] = useState<ImportPreviewType | null>(null);
  const [importResult, setImportResult] = useState<{ tasksCreated: number; milestonesCreated: number; notesCreated: number } | null>(null);
  const router = useRouter();

  const handleParse = async () => {
    if (!text.trim()) return;
    const result = await parseImportText(text);
    setPreview(result);
    setStep("preview");
  };

  const handleImport = async () => {
    if (!preview?.isValid || !preview.parsed) return;
    setStep("importing");
    try {
      const result = await executeImport(preview.parsed);
      if (result.success) {
        setImportResult(result.data);
        setStep("done");
        toast({ title: "Import successful!", description: `Project "${preview.parsed.project.title}" created with ${result.data.tasksCreated} tasks.` });
      }
    } catch (err) {
      toast({ title: "Import failed", description: String(err), variant: "destructive" });
      setStep("preview");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setText(""); setStep("input"); setPreview(null); setImportResult(null); }, 300);
    if (step === "done") router.push("/projects");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Upload className="h-4 w-4" />
            Quick Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Quick Import — AI-Generated Project
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-400">
                <li>Use ChatGPT, Claude, or Gemini to generate a project plan</li>
                <li>Ask it to format output with PROJECT, TASK, MILESTONE, NOTE blocks</li>
                <li>Paste the result below and click Parse</li>
              </ol>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Paste your structured document</label>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setText(EXAMPLE_TEXT)}>
                  Load Example
                </Button>
              </div>
              <Textarea
                placeholder="Paste your AI-generated project document here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleParse} disabled={!text.trim()}>
                Parse Document →
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4">
            <ImportPreview preview={preview} />
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("input")}>← Back to Edit</Button>
              <Button onClick={handleImport} disabled={!preview.isValid} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Confirm Import
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Importing your project...</p>
            <p className="text-sm text-muted-foreground">Creating project, tasks, milestones, and notes</p>
          </div>
        )}

        {step === "done" && importResult && preview && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-bold">Import Complete!</h3>
            <p className="text-muted-foreground">
              Project <strong>&quot;{preview.parsed.project.title}&quot;</strong> created successfully.
            </p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs mt-2">
              {[
                { label: "Tasks", value: importResult.tasksCreated },
                { label: "Milestones", value: importResult.milestonesCreated },
                { label: "Notes", value: importResult.notesCreated },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleClose} className="mt-2">View Project</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
