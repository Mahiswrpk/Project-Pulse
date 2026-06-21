# ProjectPulse

A production-ready personal project management dashboard built with Next.js 14, TypeScript, Prisma, Clerk, and shadcn/ui.

## Features

- **Dashboard** — Stats, progress charts, recent activity
- **Projects** — Full CRUD with status, priority, progress tracking
- **Tasks** — Per-project and global task management with completion tracking  
- **Milestones** — Track key deliverables with target dates
- **Notes** — Freeform documentation per project
- **Quick Import** — Paste AI-generated structured documents to bulk-create projects
- **Search** — Global search across all entities
- **Notifications** — In-app + email notifications for due dates and deadlines
- **Activity Log** — Full audit trail of all changes
- **Templates** — 5 built-in project templates (Web App, MCA, Job Search, Freelance, Startup)
- **PWA Ready** — Installable on mobile devices
- **Mobile First** — Responsive design with drawer navigation

## Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Clerk
- **Email**: Resend
- **Deployment**: Vercel

## Quick Start

```bash
cp .env.example .env
# Fill in your environment variables

npm install
npm run db:push
npm run db:seed
npm run dev
```

See [HOW_TO_EXECUTE.md](./HOW_TO_EXECUTE.md) for full setup guide.

## Documentation

- [HOW_TO_EXECUTE.md](./HOW_TO_EXECUTE.md) — Complete setup and deployment guide
- [THINGS_TO_CARE_ABOUT.md](./THINGS_TO_CARE_ABOUT.md) — Security, performance, and maintenance
- [APPLICATIONS_REQUIRED.md](./APPLICATIONS_REQUIRED.md) — All required services with setup instructions
- [ERROR_FIXES.md](./ERROR_FIXES.md) — Common errors and solutions
- [EVERYTHING_ELSE.md](./EVERYTHING_ELSE.md) — Credentials, extending the app, import system details

## Import Format

```
PROJECT
Title: My Web App
Description: A full-stack application
Priority: High
Status: Active

TASK
Title: Setup repository
Priority: High
Status: Todo
EstimatedHours: 2

MILESTONE
Title: MVP Launch
TargetDate: 2026-09-01
Status: Pending

NOTE
Title: Tech Stack
Content: Next.js, PostgreSQL, Vercel
```
