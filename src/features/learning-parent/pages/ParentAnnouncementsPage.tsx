import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, Check, Clock3 } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningSchoolAnnouncementsService } from "@/features/learning-school-announcements";

export default function ParentAnnouncementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["learning", "parent", "school-announcements", user?.id] as const;
  const announcementsQuery = useQuery({
    queryKey,
    queryFn: () => learningSchoolAnnouncementsService.listForParent(50),
    enabled: Boolean(user?.id),
  });
  const markReadMutation = useMutation({
    mutationFn: (announcementId: string) => learningSchoolAnnouncementsService.markParentRead(announcementId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });

  if (!user) return <main className="mx-auto max-w-5xl p-6">Sign in to view school announcements.</main>;

  const announcements = announcementsQuery.data ?? [];
  const unreadCount = announcements.filter((item) => !item.read_at).length;

  return <main className="mx-auto max-w-5xl space-y-6">
    <header>
      <p className="text-sm font-semibold text-indigo-700">Parent portal</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">School announcements</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">School and class notices for children actively linked to your parent account. Only notices for your linked children’s active school memberships are shown.</p>
    </header>
    <section className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><BellRing size={20}/></div>
      <div><p className="font-semibold text-slate-950">{unreadCount} unread {unreadCount === 1 ? "announcement" : "announcements"}</p><p className="text-sm text-slate-500">Reading status is saved to your parent account.</p></div>
    </section>
    {announcementsQuery.isPending ? <div className="h-40 animate-pulse rounded-2xl bg-slate-200"/>
    : announcementsQuery.isError ? <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">School announcements could not be loaded. Refresh the page and try again.</section>
    : announcements.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8"><Bell size={22} className="text-slate-400"/><h2 className="mt-3 font-semibold text-slate-950">No announcements yet</h2><p className="mt-1 text-sm leading-6 text-slate-600">When your school publishes a notice for the school or one of your linked children’s classes, it will appear here.</p></section>
    : <section className="space-y-3">{announcements.map((item) => <article key={item.id} className={"rounded-2xl border bg-white p-5 shadow-sm " + (item.read_at ? "border-slate-200" : "border-indigo-200 ring-1 ring-indigo-100")}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{item.organization_name}{item.class_group_name ? " · " + item.class_group_name : " · School-wide"}</p><h2 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h2></div><span className={item.read_at ? "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" : "inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800"}>{item.read_at ? <Check size={13}/> : <Clock3 size={13}/ >}{item.read_at ? "Read" : "Unread"}</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">Published {new Date(item.published_at).toLocaleString()}</p>{!item.read_at && <button type="button" disabled={markReadMutation.isPending} onClick={() => markReadMutation.mutate(item.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Check size={15}/>{markReadMutation.isPending ? "Saving…" : "Mark as read"}</button>}</div>
    </article>)}</section>}
  </main>;
}
