import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Circle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningNotificationsService } from "../services/learning-notifications.service";
import type { LearningNotification } from "../types/learning-notification.types";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function bookingLink(notification: LearningNotification) {
  return notification.resource_type === "marketplace_booking" ? "/marketplace" : "/notifications";
}

export default function LearningNotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ["learning-notifications", "list", user?.id],
    queryFn: () => learningNotificationsService.list(100),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000,
  });
  const unreadCount = useQuery({
    queryKey: ["learning-notifications", "unread", user?.id],
    queryFn: () => learningNotificationsService.countUnread(),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000,
  });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["learning-notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["marketplace"] }),
    ]);
  };
  const markRead = useMutation({
    mutationFn: (id: string) => learningNotificationsService.markRead(id),
    onSuccess: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: () => learningNotificationsService.markAllRead(),
    onSuccess: refresh,
  });

  if (!user) {
    return <main className="mx-auto max-w-4xl rounded-2xl border bg-white p-6">Sign in to view notifications.</main>;
  }

  const items = notifications.data ?? [];
  const unread = items.filter((item) => !item.read_at).length;

  return (
    <main className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-white/10 p-3"><Bell size={24} /></span>
            <div>
              <p className="text-sm font-semibold text-indigo-200">E&P LEARNING</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Notifications</h1>
              <p className="mt-2 text-sm text-slate-300">
                {unreadCount.data ?? unread} unread notification{(unreadCount.data ?? unread) === 1 ? "" : "s"}.
                Marketplace booking updates appear here automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={notifications.isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || (unreadCount.data ?? unread) === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          </div>
        </div>
      </header>

      {notifications.isError && (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Notifications could not be loaded. The database migration may not yet be applied, or your account may need to be checked.
          <button type="button" className="ml-2 font-semibold underline" onClick={() => void notifications.refetch()}>Retry</button>
        </section>
      )}
      {markRead.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">This notification could not be marked as read.</p>}
      {markAllRead.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Notifications could not all be marked as read.</p>}

      {notifications.isPending ? (
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-dashed bg-white p-8 text-center">
          <Bell className="mx-auto text-slate-400" size={30} />
          <h2 className="mt-3 font-semibold text-slate-900">You are all caught up</h2>
          <p className="mt-1 text-sm text-slate-500">New extra-class booking requests and responses will appear here.</p>
          <Link className="mt-4 inline-flex rounded-xl border px-4 py-2 text-sm font-semibold" to="/marketplace">Open Extra Classes</Link>
        </section>
      ) : (
        <section aria-label="Notification list" className="overflow-hidden rounded-2xl border bg-white">
          {items.map((item) => (
            <article key={item.id} className={"flex gap-3 border-b p-4 last:border-b-0 sm:p-5 " + (item.read_at ? "bg-white" : "bg-indigo-50/50")}>
              <span className="mt-1 shrink-0 text-indigo-700">{item.read_at ? <CheckCheck size={18} /> : <Circle size={10} fill="currentColor" />}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-950">{item.title}</h2>
                  <time className="text-xs text-slate-500" dateTime={item.created_at}>{dateLabel(item.created_at)}</time>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{item.body}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link className="text-sm font-semibold text-indigo-700 underline" to={bookingLink(item)}>View Extra Classes</Link>
                  {!item.read_at && (
                    <button type="button" disabled={markRead.isPending} onClick={() => markRead.mutate(item.id)} className="text-sm font-semibold text-slate-600 underline disabled:opacity-50">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      <p className="text-xs leading-5 text-slate-500">These are in-app notifications only. Email, LINE, push delivery and user-configurable notification preferences are not included in this release.</p>
    </main>
  );
}
