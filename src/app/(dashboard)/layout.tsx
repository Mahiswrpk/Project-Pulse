import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/components/shared/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-auto">
          <Header />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
/*
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/components/shared/providers";
import { ensureUserExists } from "@/actions/user.actions";
import error from "next/error";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user record exists in DB on first visit
  try {
    await ensureUserExists();
  } catch {
    // User may not be authenticated yet, middleware handles the redirect
    console.error("ensureUserExists failed:", error);
    throw error;
    
  }

  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-auto">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
*/