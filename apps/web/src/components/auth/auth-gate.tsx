"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const {
    isAuthenticated,
    isCheckingAuth,
    authError,
    loginMutation,
    registerMutation,
  } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f5f7] text-[#5e6c84]">
        Checking session…
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;
  const submitError = loginMutation.error || registerMutation.error;
  const errorMessage =
    submitError instanceof Error
      ? submitError.message
      : authError || "Unable to authenticate";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password });
      return;
    }
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-[#091e4226] bg-white p-6 shadow-[0_1px_0_rgba(9,30,66,0.25)]"
      >
        <h1 className="text-xl font-semibold text-[#172b4d]">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm text-[#5e6c84]">
          Sign in to open boards and sync changes with the API.
        </p>

        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-md border border-[#dfe1e6] bg-white px-3 py-2 text-sm text-[#172b4d] outline-none focus:border-[#0079bf] focus:ring-1 focus:ring-[#0079bf]/30"
            required
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-[#dfe1e6] bg-white px-3 py-2 text-sm text-[#172b4d] outline-none focus:border-[#0079bf] focus:ring-1 focus:ring-[#0079bf]/30"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-md border border-[#dfe1e6] bg-white px-3 py-2 text-sm text-[#172b4d] outline-none focus:border-[#0079bf] focus:ring-1 focus:ring-[#0079bf]/30"
          required
          minLength={8}
        />

        {submitError && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#0079bf] px-3 py-2 text-sm font-semibold text-white hover:bg-[#026aa7] disabled:opacity-60"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-sm text-[#0079bf] hover:underline"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
