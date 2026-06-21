import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: "Web Application",
    description: "Full-stack web application project template",
    isDefault: true,
    content: {
      project: {
        title: "Web Application",
        description: "A full-stack web application",
        status: "PLANNING",
        priority: "HIGH",
      },
      tasks: [
        { title: "Project setup & repository", status: "TODO", priority: "HIGH", estimatedHours: 2 },
        { title: "Database schema design", status: "TODO", priority: "HIGH", estimatedHours: 4 },
        { title: "Authentication implementation", status: "TODO", priority: "HIGH", estimatedHours: 6 },
        { title: "API development", status: "TODO", priority: "MEDIUM", estimatedHours: 16 },
        { title: "Frontend UI development", status: "TODO", priority: "MEDIUM", estimatedHours: 24 },
        { title: "Testing & QA", status: "TODO", priority: "MEDIUM", estimatedHours: 8 },
        { title: "Deployment & CI/CD", status: "TODO", priority: "HIGH", estimatedHours: 4 },
      ],
      milestones: [
        { title: "MVP Complete", description: "Minimum viable product ready for testing" },
        { title: "Beta Release", description: "Beta version released to select users" },
        { title: "Production Launch", description: "Full production deployment" },
      ],
    },
  },
  {
    name: "MCA Academic Project",
    description: "Template for MCA academic projects",
    isDefault: true,
    content: {
      project: {
        title: "MCA Project",
        description: "Academic project for MCA curriculum",
        status: "PLANNING",
        priority: "HIGH",
      },
      tasks: [
        { title: "Literature review & research", status: "TODO", priority: "HIGH", estimatedHours: 8 },
        { title: "Requirements documentation", status: "TODO", priority: "HIGH", estimatedHours: 4 },
        { title: "System design & architecture", status: "TODO", priority: "HIGH", estimatedHours: 6 },
        { title: "Implementation - Module 1", status: "TODO", priority: "HIGH", estimatedHours: 20 },
        { title: "Implementation - Module 2", status: "TODO", priority: "HIGH", estimatedHours: 20 },
        { title: "Testing & debugging", status: "TODO", priority: "MEDIUM", estimatedHours: 10 },
        { title: "Documentation & report writing", status: "TODO", priority: "HIGH", estimatedHours: 8 },
        { title: "Presentation preparation", status: "TODO", priority: "HIGH", estimatedHours: 4 },
      ],
      milestones: [
        { title: "Proposal Approved", description: "Project proposal reviewed and approved" },
        { title: "Mid-term Review", description: "50% implementation complete" },
        { title: "Final Submission", description: "Complete project submitted" },
      ],
    },
  },
  {
    name: "Job Search",
    description: "Organize your job search campaign",
    isDefault: true,
    content: {
      project: {
        title: "Job Search Campaign",
        description: "Systematic job search and application tracking",
        status: "ACTIVE",
        priority: "CRITICAL",
      },
      tasks: [
        { title: "Update resume & LinkedIn", status: "TODO", priority: "CRITICAL", estimatedHours: 4 },
        { title: "Build portfolio website", status: "TODO", priority: "HIGH", estimatedHours: 20 },
        { title: "Research target companies", status: "TODO", priority: "HIGH", estimatedHours: 6 },
        { title: "Apply to 5 positions per week", status: "TODO", priority: "HIGH", estimatedHours: 5 },
        { title: "Prepare for technical interviews", status: "TODO", priority: "HIGH", estimatedHours: 40 },
        { title: "Follow up on applications", status: "TODO", priority: "MEDIUM", estimatedHours: 2 },
      ],
      milestones: [
        { title: "Resume Polished", description: "Resume and LinkedIn fully updated" },
        { title: "First Interview", description: "First technical interview completed" },
        { title: "Offer Received", description: "Job offer received and accepted" },
      ],
    },
  },
  {
    name: "Freelance Project",
    description: "Client freelance project management",
    isDefault: true,
    content: {
      project: {
        title: "Freelance Project",
        description: "Client project delivery",
        status: "PLANNING",
        priority: "HIGH",
      },
      tasks: [
        { title: "Requirements gathering", status: "TODO", priority: "HIGH", estimatedHours: 3 },
        { title: "Proposal & contract signing", status: "TODO", priority: "HIGH", estimatedHours: 2 },
        { title: "Design mockups", status: "TODO", priority: "MEDIUM", estimatedHours: 8 },
        { title: "Development sprint 1", status: "TODO", priority: "HIGH", estimatedHours: 20 },
        { title: "Client review & feedback", status: "TODO", priority: "HIGH", estimatedHours: 2 },
        { title: "Revisions", status: "TODO", priority: "MEDIUM", estimatedHours: 8 },
        { title: "Delivery & handoff", status: "TODO", priority: "HIGH", estimatedHours: 3 },
        { title: "Invoice & payment", status: "TODO", priority: "CRITICAL", estimatedHours: 1 },
      ],
      milestones: [
        { title: "Contract Signed", description: "Client contract signed and deposit received" },
        { title: "First Draft Delivered", description: "First version delivered to client" },
        { title: "Project Completed", description: "Final delivery and payment received" },
      ],
    },
  },
  {
    name: "Startup Idea",
    description: "From idea to launch",
    isDefault: true,
    content: {
      project: {
        title: "Startup MVP",
        description: "Validate and build startup MVP",
        status: "PLANNING",
        priority: "HIGH",
      },
      tasks: [
        { title: "Market research & validation", status: "TODO", priority: "CRITICAL", estimatedHours: 20 },
        { title: "Competitor analysis", status: "TODO", priority: "HIGH", estimatedHours: 8 },
        { title: "Business model definition", status: "TODO", priority: "HIGH", estimatedHours: 4 },
        { title: "MVP feature scoping", status: "TODO", priority: "HIGH", estimatedHours: 4 },
        { title: "MVP development", status: "TODO", priority: "HIGH", estimatedHours: 80 },
        { title: "Beta user recruitment", status: "TODO", priority: "HIGH", estimatedHours: 10 },
        { title: "Launch & iterate", status: "TODO", priority: "HIGH", estimatedHours: 20 },
      ],
      milestones: [
        { title: "Idea Validated", description: "Market validation complete with real user feedback" },
        { title: "MVP Built", description: "Minimum viable product ready" },
        { title: "First 100 Users", description: "100 active users acquired" },
      ],
    },
  },
];

async function main() {
  console.log("Seeding default templates...");

  for (const template of DEFAULT_TEMPLATES) {
    await prisma.projectTemplate.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, "-"),
        name: template.name,
        description: template.description,
        isDefault: template.isDefault,
        content: template.content,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
