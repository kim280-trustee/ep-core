import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Plus, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentStatus, LearningContentType } from "@/features/learning-content";

const contentTypes: Array<LearningContentType | "all"> = [
  "all", "lesson", "explanation", "reading", "listening", "speaking", "writing",
  "worksheet", "video", "audio", "interactive", "reference", "other",
];
const statuses: Array<LearningContentStatus | "all"> = ["all", "draft", "review", "published", "retired"];
const typeLabels: Record<LearningContentType, string> = {
  lesson: "Lesson", explanation: "Explanation", reading: "Reading", listening: "Listening",
  speaking: "Speaking", writing: "Writing", worksheet: "Worksheet", video: "Video",
  audio: "Audio", interactive: "Interactive", reference: "Reference", other: "Other",
};
const statusClasses: Record<LearningContentStatus, string> = {
  draft: "bg-slate-100 text-slate-700", review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800", retired: "bg-red-100 text-red-700",
};

export default function TeacherContentLibraryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LearningContentStatus | "all">("all");
  const [contentType, setContentType] = useState<LearningContentType | "all">("all");
  const classes = useQuery({ queryKey: ["learning", "teacher-classes", user?.id], queryFn: () => learningTeacherService.listTeacherClasses(user!.id), enabled: Boolean(user?.id) });
  const organizationId = classes.data?.[0]?.membership.organizationId;
  const content = useQuery({ queryKey: ["learning", "teacher-content-library", organizationId], queryFn: () => learningContentService.listContent(organizationId), enabled: Boolean(organizationId) });
  const filteredContent = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (content.data ?? []).filter((item) => (!query || item.title.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)) && (status === "all" || item.status === status) && (contentType === "all" || item.contentType === contentType));
  }, [content.data, search, status, contentType]);
  if (!user) return <EmptyState text="Sign in to access the teacher content library." />;
  if (classes.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError) return <ErrorState text="We could not load your teacher context." onRetry={() => void classes.refetch()} />;
  if (!classes.data?.length) return <EmptyState text="No active teacher class is assigned yet." />;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><BookOpen size={18} />Teacher Content</div><h1 className="mt-1 text-2xl font-bold text-slate-900">Content Library</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Find and manage reusable learning materials for your organization.</p></div>
          <Link to="/teacher/content/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus size={17} />Create content</Link>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block"><span className="sr-only">Search content</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or code" className="input w-full pl-10" /></label>
          <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as LearningContentStatus | "all")} className="input w-full">{statuses.map((value) => <option key={value} value={value}>{value === "all" ? "All statuses" : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
          <label><span className="sr-only">Filter by content type</span><select value={contentType} onChange={(event) => setContentType(event.target.value as LearningContentType | "all")} className="input w-full">{contentTypes.map((value) => <option key={value} value={value}>{value === "all" ? "All content types" : typeLabels[value]}</option>)}</select></label>
        </div>
      </section>
      {content.isPending ? <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> : content.isError ? <ErrorState text="Content could not be loaded." onRetry={() => void content.refetch()} /> : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Learning materials</h2><p className="mt-1 text-xs text-slate-500">{filteredContent.length} of {(content.data ?? []).length} items</p></div><button type="button" onClick={() => void content.refetch()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Refresh content"><RefreshCw size={17} /></button></div>
          {filteredContent.length ? <div className="divide-y divide-slate-100">{filteredContent.map((item) => (
            <Link key={item.id} to={`/teacher/content/${item.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{item.title}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><span>{item.code}</span><span>·</span><span>{typeLabels[item.contentType]}</span><span>·</span><span>{item.languageCode.toUpperCase()}</span></div></div>
              <div className="flex items-center gap-3"><span className={"inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold " + statusClasses[item.status]}>{item.status[0].toUpperCase() + item.status.slice(1)}</span><ExternalLink size={16} className="text-slate-400" /></div>
            </Link>
          ))}</div> : <div className="px-5 py-12 text-center"><BookOpen size={28} className="mx-auto text-slate-300" /><p className="mt-3 font-medium text-slate-700">No matching content</p><p className="mt-1 text-sm text-slate-500">Try changing the search or filters.</p></div>}
        </section>
      )}
    </div>
  );
}
function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>; }
function ErrorState({ text, onRetry }: { text: string; onRetry: () => void }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="font-semibold">{text}</p><button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium"><RefreshCw size={16} />Try again</button></div>; }
