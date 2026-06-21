/*import type {
  Project, Task, Milestone, Note, Notification, ActivityLog,
  Tag, ProjectTemplate, NotificationPreference, User,
  ProjectStatus, Priority, TaskStatus, MilestoneStatus,
  NotificationType, ActivityAction,
} from "@prisma/client";
*/
import type {
  Project,
  Task,
  Milestone,
  Note,
  Notification,
  ActivityLog,
  Tag,
  ProjectTemplate,
  NotificationPreference,
  User,
  ProjectStatus,
  Priority,
  TaskStatus,
  MilestoneStatus,
  NotificationType,
  ActivityAction,
  Prisma,
} from "@prisma/client";

export type {
  Project, Task, Milestone, Note, Notification, ActivityLog,
  Tag, ProjectTemplate, NotificationPreference, User,
  ProjectStatus, Priority, TaskStatus, MilestoneStatus,
  NotificationType, ActivityAction,
};

// Extended types with relations
export type ProjectWithRelations = Project & {
  tasks: Task[];
  milestones: Milestone[];
  notes: Note[];
  tags: (TagsOnProjects & { tag: Tag })[];
  _count?: { tasks: number; milestones: number; notes: number };
};

export type TaskWithRelations = Task & {
  project: Project;
  tags: (TagsOnTasks & { tag: Tag })[];
};

export type MilestoneWithProject = Milestone & { project: Project };
export type NoteWithProject = Note & { project: Project };

export type TagsOnProjects = { projectId: string; tagId: string };
export type TagsOnTasks = { taskId: string; tagId: string };

export type ActivityLogWithRelations = ActivityLog & {
  project?: Project | null;
  task?: Task | null;
  milestone?: Milestone | null;
  note?: Note | null;
};

// Dashboard stats
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  tasksDueToday: number;
  overdueTasks: number;
  upcomingMilestones: number;
  totalTasks: number;
  completedTasks: number;
}

// Import types
export interface ImportedProject {
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  customFields?: Prisma.InputJsonValue;
  
}

export interface ImportedTask {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatedHours?: number;
  dueDate?: string;
  customFields?: Prisma.InputJsonValue;
}

export interface ImportedMilestone {
  title: string;
  description?: string;
  targetDate?: string;
  status?: MilestoneStatus;
  completionPercentage?: number;
}

export interface ImportedNote {
  title: string;
  content: string;
}

export interface ParsedImport {
  project: ImportedProject;
  tasks: ImportedTask[];
  milestones: ImportedMilestone[];
  notes: ImportedNote[];
}

export interface ImportValidationError {
  field: string;
  message: string;
  line?: number;
}

export interface ImportPreview {
  parsed: ParsedImport;
  errors: ImportValidationError[];
  warnings: string[];
  isValid: boolean;
}

// Search
export interface SearchResult {
  id: string;
  type: "project" | "task" | "milestone" | "note";
  title: string;
  description?: string;
  projectTitle?: string;
  status?: string;
  priority?: string;
  href: string;
}

// Form types
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

// Pagination
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
