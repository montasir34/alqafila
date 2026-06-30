"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";

type Notification = {
  id: string;
  type: string;
  message: string;
  relatedId: string | null;
  read: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  PAYMENT_RECEIVED: "💳",
  NEED_FULFILLED: "✅",
  VERIFY_RESULT: "🏅",
  NEW_MESSAGE: "💬",
  REPORT_UPDATE: "🚩",
};

export function NotificationsClient() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const unreadCount = data?.notifications?.filter(n => !n.read).length ?? 0;

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 max-w-2xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const notifications = data?.notifications ?? [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          الإشعارات {unreadCount > 0 && (
            <span className="text-sm bg-amber-700 text-white rounded-full px-2 py-0.5 ms-1">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>تحديد الكل كمقروء</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-fg">
          <p className="text-4xl mb-3">🔔</p>
          <p>لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id}
              className={`rounded-xl border p-4 flex gap-3 items-start transition-colors ${
                n.read ? "border-border bg-background" : "border-amber-200 bg-amber-50"
              }`}>
              <span className="text-2xl shrink-0">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="text-xs text-muted-fg mt-1">{new Date(n.createdAt).toLocaleDateString("ar-SD")}</p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-amber-600 mt-1 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
