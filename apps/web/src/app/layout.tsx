import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trello Clone — Kanban Project Management",
  description:
    "A production-ready Kanban-style project management tool built with Next.js, Express, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
