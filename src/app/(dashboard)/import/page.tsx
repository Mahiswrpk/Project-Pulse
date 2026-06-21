import { ImportModal } from "@/components/import/import-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Zap, FileText, CheckSquare, Milestone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quick Import" };

const EXAMPLE_PROMPTS = [
  {
    title: "Web App Project",
    prompt: `Ask ChatGPT or Claude:\n\n"Create a structured project plan for building a [your app idea] web application. Format it with PROJECT, TASK, MILESTONE, and NOTE blocks where each section uses Key: Value pairs. Include status and priority for each item."`,
  },
  {
    title: "Study Plan",
    prompt: `Ask Claude:\n\n"Create a study plan for [subject/exam] formatted as PROJECT, TASK, MILESTONE, NOTE blocks with Key: Value pairs. Include estimated hours for each task."`,
  },
  {
    title: "Job Search",
    prompt: `Ask Gemini:\n\n"Create a job search action plan formatted with PROJECT, TASK (with EstimatedHours), MILESTONE, and NOTE blocks using Key: Value format. Include realistic statuses and priorities."`,
  },
];

export default function ImportPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Quick Import
        </h1>
        <p className="text-muted-foreground mt-1">
          Use an AI assistant to generate structured project plans, then import them here instantly.
        </p>
      </div>

      {/* Main CTA */}
      <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 text-center">
        <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Paste Your AI-Generated Plan</h2>
        <p className="text-muted-foreground mb-6">Generate a project plan with ChatGPT, Claude, or Gemini → paste it here → done!</p>
        <ImportModal>
          <Button size="lg" className="gap-2">
            <Upload className="h-5 w-5" />
            Open Import
          </Button>
        </ImportModal>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-semibold mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Ask an AI", desc: "Use ChatGPT, Claude, Gemini, or any AI to generate a structured project plan", icon: Zap },
            { step: "2", title: "Paste Here", desc: "Copy the formatted output and paste it into the import modal", icon: Upload },
            { step: "3", title: "Done!", desc: "Your project, tasks, milestones, and notes are created instantly", icon: CheckSquare },
          ].map(({ step, title, desc, icon: Icon }) => (
            <Card key={step}>
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">{step}</span>
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Document Format */}
      <Card>
        <CardHeader><CardTitle className="text-base">Expected Format</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Your AI-generated document should use these blocks with Key: Value pairs:</p>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
{`PROJECT
Title: My Web App
Description: A full-stack web application
Priority: High
Status: Active

TASK
Title: Setup repository
Priority: High
Status: Todo
EstimatedHours: 2

TASK
Title: Build homepage
Priority: Medium
Status: Backlog
EstimatedHours: 8

MILESTONE
Title: MVP Launch
TargetDate: 2026-09-01
Status: Pending

NOTE
Title: Tech Decisions
Content: Using Next.js, Tailwind, PostgreSQL`}
          </pre>
        </CardContent>
      </Card>

      {/* Sample Prompts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Sample AI Prompts</h2>
        <div className="space-y-3">
          {EXAMPLE_PROMPTS.map((ep) => (
            <Card key={ep.title}>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{ep.title}</h3>
                <pre className="text-xs text-muted-foreground bg-muted rounded p-3 whitespace-pre-wrap">{ep.prompt}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
