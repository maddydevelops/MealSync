"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "@/components/ui/sonner"

const WaveLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="w-2 h-8 bg-primary rounded-sm animate-wave"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
    <p className="text-foreground text-sm font-medium">Loading...</p>
  </div>
);

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const role = session?.user?.role;
      const path = window.location.pathname;

      // Redirect root to dashboard
      if (path === "/") {
        if (role === "superadmin") router.push("/dashboard");
        if (role === "owner") router.push("/owner/dashboard");
      }

      // Prevent access to wrong role's pages
      if (role === "superadmin" && path.startsWith("/owner")) {
        router.push("/dashboard");
      }
      if (role === "owner" && !path.startsWith("/owner")) {
        router.push("/owner/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") return <WaveLoader />;

  return (
    <HeroUIProvider navigate={router.push}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px" },
            }}
          />
        </main>
      </SidebarProvider>
    </HeroUIProvider>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  session?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, session }) => (
  <SessionProvider session={session}>
    <LayoutContent>{children}</LayoutContent>
  </SessionProvider>
);

export default Layout;
