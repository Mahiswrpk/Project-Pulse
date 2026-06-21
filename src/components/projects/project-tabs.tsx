"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckSquare, Milestone as MilestoneIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { MilestoneForm } from "@/components/milestones/milestone-form";
import { NoteForm } from "@/components/notes/note-form";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { deleteMilestone } from "@/actions/milestone.actions";
import { deleteNote } from "@/actions/note.actions";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import type { Project, Task, Milestone, Note } from "@/types";

interface ProjectWithRelations extends Project {
  tasks: Task[];
  milestones: Milestone[];
  notes: Note[];
}

export function ProjectTabs({ project }: { project: ProjectWithRelations }) {
  const router = useRouter();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const handleDeleteMilestone = async (id: string) => {
    await deleteMilestone(id);
    toast({ title: "Milestone deleted" });
    router.refresh();
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    toast({ title: "Note deleted" });
    router.refresh();
  };

  return (
    <>
      <Tabs defaultValue="tasks">
        <TabsList className="w-full sm:w-auto flex">
          <TabsTrigger value="tasks" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <CheckSquare className="h-4 w-4" />
            <span>Tasks ({project.tasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <MilestoneIcon className="h-4 w-4" />
            <span>Milestones ({project.milestones.length})</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <FileText className="h-4 w-4" />
            <span>Notes ({project.notes.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          </div>
          {project.tasks.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No tasks yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setTaskDialogOpen(true)}>
                Add your first task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditMilestone(null); setMilestoneDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Milestone
            </Button>
          </div>
          {project.milestones.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <MilestoneIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No milestones yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setMilestoneDialogOpen(true)}>
                Add your first milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {project.milestones.map((ms) => (
                <Card key={ms.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{ms.title}</h4>
                      {ms.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{ms.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <StatusBadge status={ms.status} />
                        {ms.targetDate && (
                          <span className="text-xs text-muted-foreground">
                            Target: {formatDate(ms.targetDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => { setEditMilestone(ms); setMilestoneDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                      <DeleteDialog
                        title="Delete Milestone"
                        description={`Delete "${ms.title}"? This cannot be undone.`}
                        onDelete={() => handleDeleteMilestone(ms.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditNote(null); setNoteDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Note
            </Button>
          </div>
          {project.notes.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No notes yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setNoteDialogOpen(true)}>
                Add your first note
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {project.notes.map((note) => (
                <Card key={note.id} className="p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium">{note.title}</h4>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => { setEditNote(note); setNoteDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                      <DeleteDialog
                        title="Delete Note"
                        description={`Delete "${note.title}"?`}
                        onDelete={() => handleDeleteNote(note.id)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(note.updatedAt)}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            projectId={project.id}
            onSuccess={() => { setTaskDialogOpen(false); router.refresh(); }}
            onCancel={() => setTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
          </DialogHeader>
          <MilestoneForm
            projectId={project.id}
            milestone={editMilestone ?? undefined}
            onSuccess={() => { setMilestoneDialogOpen(false); setEditMilestone(null); router.refresh(); }}
            onCancel={() => { setMilestoneDialogOpen(false); setEditMilestone(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editNote ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>
          <NoteForm
            projectId={project.id}
            note={editNote ?? undefined}
            onSuccess={() => { setNoteDialogOpen(false); setEditNote(null); router.refresh(); }}
            onCancel={() => { setNoteDialogOpen(false); setEditNote(null); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
