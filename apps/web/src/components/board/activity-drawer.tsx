"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

interface ActivityUser {
  id: string;
  name: string;
}

interface ActivityItem {
  id: string;
  description: string;
  action: string;
  user?: ActivityUser;
  createdAt: string;
}

interface ActivityDrawerProps {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

export function ActivityDrawer({ boardId, open, onClose }: ActivityDrawerProps) {
  const activityQuery = useQuery({
    queryKey: ["board-activity", boardId],
    queryFn: () =>
      apiGet<ActivityItem[]>(
        `/activity/board/${boardId}?limit=50`
      ),
    enabled: open,
    retry: false,
  });

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-[#091e4226] bg-[#f4f5f7] p-4 shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-secondary"
          >
            Close
          </button>
        </div>

        {activityQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        )}

        {activityQuery.error && (
          <p className="text-sm text-muted-foreground">
            No server activity available yet. Start moving cards/lists after signing in.
          </p>
        )}

        {activityQuery.data && (
          <ul className="space-y-3 overflow-y-auto pr-1">
            {activityQuery.data.map((item) => (
              <li key={item.id} className="rounded-md border border-border bg-card p-3">
                <p className="text-sm text-foreground">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.user?.name || "System"} - {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
