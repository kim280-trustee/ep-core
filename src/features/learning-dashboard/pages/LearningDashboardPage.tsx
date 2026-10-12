import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Compass,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import { learningAssignmentsService } from "@/features/learning-assignments";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Due date unavailable";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function activityLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LearningDashboardPage() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";

  const query = useQuery({
    queryKey: ["learning", "student-overview", studentUserId],
    queryFn: async () => {
      const overview = await learningRuntimeService.getStudentOverview(studentUserId);
      const recommendations = await Promise.all(
        overview.recommendations.map(async (item) => {
          if (!item.assessmentId) return { ...item, assignmentId: null };
          const assignment = await learningAssignmentsService.findStudentAssignmentForAssessment(item.assessmentId, studentUserId);
          return { ...item, assignmentId: assignment?.id ?? null };
        }),
      );
      return {
        ...overview,
        recommendations: recommendations.filter((item) => !item.assessmentId || Boolean(item.assignmentId)),
      };
    },
    enabled: Boolean(studentUserId),
  });

  if (!user) return <div className="rounded-3xl border border-slate-200 bg-white p-6">Sign in to view your learning dashboard.</div>;
  if (query.isPending) return <div className="space-y-5"><div className="h-64 animate-pulse rounded-[2rem] bg-violet-100" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="h-32 animate-pulse rounded-3xl bg-white" /><div className="h-32 animate-pulse rounded-3xl bg-white" /><div className="h-32 animate-pulse rounded-3xl bg-white" /><div className="h-32 animate-pulse rounded-3xl bg-white" /></div></div>;
  if (query.isError) return <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800"><AlertCircle className="mt-0.5 shrink-0" size={20} /><div><p className="font-semibold">We could not load your learning dashboard.</p><p className="mt-1 text-sm">Please try again. Your learning data has not been changed.</p><button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm">Try again</button></div></div>;

  const overview = query.data;
  const inProgress = overview.progress.filter((p) => p.status === "in_progress");
  const completed = overview.progress.filter((p) => p.status === "completed");
  const averageMastery = overview.mastery.length ? Math.round(overview.mastery.reduce((sum, item) => sum + item.masteryScore, 0) / overview.mastery.length) : 0;
  const assignmentsById = new Map(overview.assignments.map((a) => [a.id, a]));
  const continueItems = inProgress.flatMap((progress) => { const assignment = assignmentsById.get(progress.assignmentId); return assignment ? [{ progress, assignment }] : []; }).slice(0, 4);
  const dueAssignments = overview.assignments.filter((a) => a.status === "published").slice(0, 5);
  const completedAssignmentIds = new Set(completed.map((item) => item.assignmentId));
  const reminderCutoff = now === null ? 0 : now + 7 * 24 * 60 * 60 * 1000;
  const dueAlerts = now === null ? [] : overview.assignments
    .filter((assignment) => assignment.status === "published" && Boolean(assignment.dueAt) && !completedAssignmentIds.has(assignment.id) && new Date(assignment.dueAt!).getTime() <= reminderCutoff)
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
    .slice(0, 5);
  const firstContinue = continueItems[0]?.assignment;

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#6558d9] px-6 py-7 text-white shadow-[0_18px_50px_-24px_rgba(101,88,217,0.65)] sm:px-9 sm:py-9 lg:min-h-[270px]">
      <div className="pointer-events-none absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full bg-[#8f83ff] opacity-70" />
      <div className="pointer-events-none absolute right-24 top-32 -z-10 h-28 w-28 rounded-full bg-[#f8c95c] opacity-90" />
      <div className="pointer-events-none absolute bottom-[-75px] left-[35%] -z-10 h-48 w-48 rounded-full bg-[#5144c0]" />
      <div className="grid items-center gap-5 md:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wide text-white"><Sparkles size={14} /> YOUR LEARNING ADVENTURE</span>
          <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Hey, {user.name || "Explorer"}! <span aria-hidden="true">Ready to grow?</span></h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">Every lesson is a step forward. Pick up where you left off or discover something new today.</p>
          {firstContinue ? <Link to={`/learning/assignments/${firstContinue.id}`} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#ffe27a] px-5 py-3 text-sm font-extrabold text-[#43369e] shadow-lg shadow-violet-950/15 transition hover:-translate-y-0.5 hover:bg-[#ffeb9b]">Continue learning <ArrowRight size={17} /></Link> : <Link to="/learning/assignments" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#ffe27a] px-5 py-3 text-sm font-extrabold text-[#43369e] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffeb9b]">Explore my learning <ArrowRight size={17} /></Link>}
        </div>
        <div className="relative mx-auto w-full max-w-[350px] md:ml-auto">
          <HeroLearningIllustration />
        </div>
      </div>
      <div className="pointer-events-none absolute right-8 top-7 hidden text-[#ffe27a] sm:block"><Star size={25} fill="currentColor" /></div>
      <div className="pointer-events-none absolute bottom-7 right-[42%] hidden text-white/70 sm:block"><Sparkles size={21} /></div>
    </section>

    <section aria-label="Your learning summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<Target size={20} />} label="Skill mastery" value={overview.mastery.length ? averageMastery + "%" : "—"} detail={overview.mastery.length + " learning objectives"} tone="violet" />
      <Stat icon={<BookOpen size={20} />} label="My assignments" value={String(overview.assignments.length)} detail={inProgress.length + " in progress"} tone="blue" />
      <Stat icon={<CheckCircle2 size={20} />} label="Completed" value={String(completed.length)} detail="completed activities" tone="mint" />
      <Stat icon={<TrendingUp size={20} />} label="Recommended" value={String(overview.recommendations.length)} detail="next steps for you" tone="peach" />
    </section>

    {dueAlerts.length > 0 && <section className="rounded-3xl border border-amber-200 bg-[#fff9e9] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700"><CalendarCheck size={21} /></div><div><h2 className="font-extrabold text-slate-800">A little reminder</h2><p className="text-sm text-slate-600">You have learning activities coming up.</p></div></div>
      <div className="grid gap-3 md:grid-cols-2">{dueAlerts.map((assignment) => {
        const overdue = now !== null && new Date(assignment.dueAt!).getTime() < now;
        return <Link key={assignment.id} to={`/learning/assignments/${assignment.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="min-w-0"><p className="truncate font-bold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">Due {formatDate(assignment.dueAt)}</p></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${overdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>{overdue ? "Overdue" : "Coming up"}</span></Link>;
      })}</div>
    </section>}

    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <DashboardCard title="Pick up where you left off" subtitle="Your next step is waiting." icon={<BookOpenCheck size={21} />} accent="violet">
        {continueItems.length ? <div className="grid gap-3 sm:grid-cols-2">{continueItems.map(({ assignment, progress }, index) => <Link key={progress.id} to={`/learning/assignments/${assignment.id}`} className={`group overflow-hidden rounded-3xl border p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${index % 2 === 0 ? "border-violet-100 bg-[#f7f5ff]" : "border-sky-100 bg-[#f1f9ff]"}`}>
          <div className="flex items-start justify-between gap-2"><div className={`rounded-2xl p-2.5 ${index % 2 === 0 ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>{index % 2 === 0 ? <BookOpen size={20} /> : <Compass size={20} />}</div><span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600">IN PROGRESS</span></div>
          <h3 className="mt-4 line-clamp-2 font-extrabold text-slate-800">{assignment.title}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{assignment.description || "Keep going—you are making progress."}</p>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500"><span>Continue your journey</span><ArrowRight className="transition group-hover:translate-x-1" size={16} /></div>
        </Link>)}</div> : <EmptyState title="Your adventure starts here" text="When you begin an assignment, you will find it here ready for you to continue." illustration="book" />}
      </DashboardCard>

      <DashboardCard title="Your next discoveries" subtitle="Activities selected to help you grow." icon={<Compass size={21} />} accent="blue">
        {overview.recommendations.length ? <div className="space-y-3">{overview.recommendations.slice(0, 4).map((item, index) => <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-sky-200 hover:bg-sky-50/40">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${["bg-[#e8e4ff] text-violet-700", "bg-[#dff5ff] text-sky-700", "bg-[#dcf8eb] text-emerald-700", "bg-[#fff0d7] text-amber-700"][index % 4]}`}>{index % 2 === 0 ? <Star size={21} /> : <Sparkles size={21} />}</div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold capitalize text-slate-800">{activityLabel(item.recommendationType)}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">NEXT STEP</span></div><p className="mt-1 break-words text-xs leading-5 text-slate-500">{item.objectiveId ? "Focus: " + item.objectiveId : "A learning activity picked for you."}</p>
          {item.assessmentId && item.assignmentId && <Link to={`/learning/assignments/${item.assignmentId}/assessments/${item.assessmentId}`} className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-violet-700 hover:text-violet-900">Start activity <ArrowRight size={14} /></Link>}</div>
        </div>)}</div> : <EmptyState title="Your map is unfolding" text="As your learning history grows, we will suggest activities that fit your next step." illustration="compass" />}
      </DashboardCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <DashboardCard title="My assignments" subtitle="Keep an eye on what is ready for you." icon={<CalendarCheck size={21} />} accent="peach">
        {dueAssignments.length ? <div className="space-y-2">{dueAssignments.map((assignment, index) => <Link key={assignment.id} to={`/learning/assignments/${assignment.id}`} className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#fff7eb]"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${index % 3 === 0 ? "bg-[#ffead8] text-orange-700" : index % 3 === 1 ? "bg-[#e4e0ff] text-violet-700" : "bg-[#dff6ec] text-emerald-700"}`}>{index % 2 === 0 ? <BookOpen size={20} /> : <Clock3 size={20} />}</div><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">{assignment.dueAt ? "Due " + formatDate(assignment.dueAt) : "Take it at your own pace"}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600">{assignment.status}</span><ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" /></Link>)}</div> : <EmptyState title="No missions just yet" text="Published assignments will appear here when they are ready." illustration="book" />}
      </DashboardCard>

      <DashboardCard title="Recent little wins" subtitle="Your learning activity, one step at a time." icon={<Trophy size={21} />} accent="mint">
        {overview.recentActivity.length ? <div className="space-y-1">{overview.recentActivity.slice(0, 5).map((event, index) => <div key={event.id} className="flex items-center gap-3 rounded-2xl p-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? "bg-[#e0f7eb] text-emerald-700" : "bg-[#fff0d7] text-amber-700"}`}>{index % 2 === 0 ? <CheckCircle2 size={19} /> : <Star size={19} />}</div><div className="min-w-0 flex-1"><p className="font-bold text-slate-800">{activityLabel(event.activityType)}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.occurredAt)}</p></div><span className="text-xs font-semibold text-emerald-700">Recorded</span></div>)}</div> : <EmptyState title="Your first win is waiting" text="Every completed learning activity will help tell your progress story here." illustration="star" />}
      </DashboardCard>
    </div>
  </div>;
}

function Stat({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: "violet" | "blue" | "mint" | "peach" }) {
  const tones = {
    violet: "bg-[#eeeaff] text-violet-700",
    blue: "bg-[#e1f5ff] text-sky-700",
    mint: "bg-[#def8eb] text-emerald-700",
    peach: "bg-[#fff0df] text-orange-700",
  };
  return <div className="group rounded-3xl border border-white bg-white p-4 shadow-[0_6px_24px_-18px_rgba(36,38,85,0.35)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><div className="flex items-center gap-3"><div className={`rounded-2xl p-2.5 ${tones[tone]}`}>{icon}</div><span className="text-sm font-bold text-slate-500">{label}</span></div><p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{detail}</p></div>;
}

function DashboardCard({ title, subtitle, icon, children, accent }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode; accent: "violet" | "blue" | "peach" | "mint" }) {
  const tones = { violet: "bg-[#eeeaff] text-violet-700", blue: "bg-[#e1f5ff] text-sky-700", peach: "bg-[#fff0df] text-orange-700", mint: "bg-[#def8eb] text-emerald-700" };
  return <section className="rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-[0_8px_34px_-25px_rgba(31,41,75,0.35)] sm:p-6"><div className="mb-5 flex items-start gap-3"><div className={`rounded-2xl p-2.5 ${tones[accent]}`}>{icon}</div><div><h2 className="text-lg font-extrabold tracking-tight text-slate-800">{title}</h2><p className="mt-0.5 text-sm text-slate-500">{subtitle}</p></div></div>{children}</section>;
}

function EmptyState({ title, text, illustration }: { title: string; text: string; illustration: "book" | "compass" | "star" }) {
  return <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-[#fbfaff] px-5 py-6 text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#eeeaff] text-violet-700">{illustration === "book" ? <BookOpen size={26} /> : illustration === "compass" ? <Compass size={26} /> : <Star size={26} />}</div><p className="font-extrabold text-slate-800">{title}</p><p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">{text}</p></div>;
}

function HeroLearningIllustration() {
  return <svg viewBox="0 0 360 260" role="img" aria-label="Illustration of students learning together" className="w-full drop-shadow-[0_18px_22px_rgba(42,31,112,0.18)]">
    <ellipse cx="181" cy="228" rx="142" ry="18" fill="#4b40b4" opacity=".45" />
    <circle cx="185" cy="119" r="101" fill="#8e83ff" />
    <circle cx="274" cy="65" r="21" fill="#ffe27a" />
    <path d="M276 33v-9M276 106v-9M244 65h-9M315 65h-9M253 42l-7-7M302 91l-7-7M301 42l7-7" stroke="#ffe27a" strokeWidth="4" strokeLinecap="round" />
    <path d="M49 151c-9-24 3-44 26-47 20-3 36 13 34 33l-4 47H57z" fill="#ffb27d" />
    <path d="M54 129c-3-21 9-37 29-36 17 1 28 14 25 31-9-4-14-10-18-17-8 12-21 19-36 22z" fill="#3b2b58" />
    <ellipse cx="84" cy="132" rx="22" ry="27" fill="#b96b43" />
    <path d="M61 125c1-22 14-35 31-32 14 2 23 13 20 29-12-4-20-11-24-18-7 11-16 18-27 21z" fill="#3b2b58" />
    <circle cx="77" cy="134" r="2.5" fill="#3b2b58" /><circle cx="92" cy="134" r="2.5" fill="#3b2b58" /><path d="M78 145q7 7 14 0" fill="none" stroke="#7e3c2d" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M49 166q34-17 65 2l17 48H32z" fill="#ffce62" />
    <path d="M60 168l23 28 22-28" fill="#fff1b9" />
    <path d="M126 207l-8 21M47 207l-3 21" stroke="#3b2b58" strokeWidth="8" strokeLinecap="round" />
    <path d="M180 143c-8-29 7-54 34-55 23-1 42 17 40 43l-3 49h-68z" fill="#e5a17a" />
    <path d="M178 123c-4-26 12-43 35-43 24 0 39 19 36 41-15-4-27-15-33-27-7 15-20 25-38 29z" fill="#493158" />
    <ellipse cx="211" cy="132" rx="25" ry="29" fill="#8f523c" />
    <path d="M187 124c2-22 16-36 33-34 16 1 28 14 26 31-13-4-23-12-29-21-6 12-17 20-30 24z" fill="#493158" />
    <circle cx="202" cy="135" r="2.5" fill="#382447" /><circle cx="219" cy="135" r="2.5" fill="#382447" /><path d="M203 146q8 7 16 0" fill="none" stroke="#713a32" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M173 169q37-19 76 2l19 49h-111z" fill="#70dfbd" />
    <path d="M188 170l23 27 23-27" fill="#c5ffed" />
    <path d="M181 214l-5 15M244 214l5 15" stroke="#493158" strokeWidth="8" strokeLinecap="round" />
    <path d="M129 198q-4-29 24-37 28-8 44 18l-8 42h-57z" fill="#f7bd91" />
    <ellipse cx="155" cy="160" rx="23" ry="27" fill="#d88c62" />
    <path d="M132 157c-2-22 11-37 28-36 17 0 28 14 25 32-12-5-22-13-27-23-5 12-14 21-26 27z" fill="#282d58" />
    <circle cx="148" cy="162" r="2.5" fill="#282d58" /><circle cx="164" cy="162" r="2.5" fill="#282d58" /><path d="M149 173q7 7 14 0" fill="none" stroke="#874b3b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M128 192q28-14 53 2l12 36h-74z" fill="#ff8b91" />
    <path d="M137 193l18 20 18-20" fill="#ffd7d7" />
    <rect x="109" y="203" width="137" height="12" rx="6" fill="#ffdc75" />
    <path d="M119 215l-9 15M234 215l8 15" stroke="#493158" strokeWidth="7" strokeLinecap="round" />
    <path d="M120 183l-23 18M238 185l21 14" stroke="#d88c62" strokeWidth="11" strokeLinecap="round" />
    <rect x="124" y="186" width="105" height="52" rx="8" fill="#fffaf0" stroke="#5145bb" strokeWidth="3" transform="rotate(-5 124 186)" />
    <path d="M137 200l23 1M136 210l44-4M136 220l32-3" stroke="#b7b0f7" strokeWidth="4" strokeLinecap="round" />
    <path d="M82 68l5-12 5 12 12 5-12 5-5 12-5-12-12-5z" fill="#fff2a6" />
    <path d="M300 144l4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#ffc6de" />
    <circle cx="42" cy="82" r="5" fill="#ffe27a" /><circle cx="315" cy="188" r="4" fill="#fff" opacity=".8" />
  </svg>;
}
