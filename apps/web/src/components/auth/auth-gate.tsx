"use client";

import { useAuth } from "@/hooks/use-auth";
import { LayoutGrid } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg, #0079bf 0%, #5aac44 100%)" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
          <LayoutGrid className="h-7 w-7 text-[#0079bf]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-sm font-medium text-white/80">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
