"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LayoutGrid } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingAuth, authError, loginMutation, registerMutation } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0079bf]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-sm font-medium text-white/70">Loading…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;
  const submitError = loginMutation.error || registerMutation.error;
  const errorMessage =
    submitError instanceof Error ? submitError.message : authError || "Unable to authenticate";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ name, email, password });
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0079bf 0%, #5aac44 100%)",
      }}
    >
      {/* Subtle noise overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg">
            <LayoutGrid className="h-6 w-6 text-[#0079bf]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Trello Clone</h1>
          <p className="text-sm text-white/70">
            {mode === "login" ? "Sign in to your workspace" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white px-8 py-8 shadow-2xl"
        >
          <h2 className="mb-6 text-lg font-bold text-[#172b4d]">
            {mode === "login" ? "Welcome back" : "Get started"}
          </h2>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                  className="w-full rounded-lg border border-[#dfe1e6] bg-[#fafbfc] px-3 py-2.5 text-sm text-[#172b4d] placeholder:text-[#a5adba] outline-none transition focus:border-[#0079bf] focus:bg-white focus:ring-2 focus:ring-[#0079bf]/20"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-[#dfe1e6] bg-[#fafbfc] px-3 py-2.5 text-sm text-[#172b4d] placeholder:text-[#a5adba] outline-none transition focus:border-[#0079bf] focus:bg-white focus:ring-2 focus:ring-[#0079bf]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5e6c84]">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full rounded-lg border border-[#dfe1e6] bg-[#fafbfc] px-3 py-2.5 text-sm text-[#172b4d] placeholder:text-[#a5adba] outline-none transition focus:border-[#0079bf] focus:bg-white focus:ring-2 focus:ring-[#0079bf]/20"
              />
            </div>
          </div>

          {submitError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-[#0079bf] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#026aa7] active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-[#0079bf] hover:underline font-medium"
            >
              {mode === "login" ? "Don't have an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
