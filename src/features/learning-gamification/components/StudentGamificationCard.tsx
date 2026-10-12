import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BookOpen, CheckCircle2, Medal, RefreshCw, Sparkles, Target, Trophy } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningGamificationService } from "../services/learning-gamification.service";
import type { LearningBadge } from "../types/learning-gamification.types";

const badgeIcons = {
  sparkles: Sparkles,
  book: BookOpen,
  target: Target,
  trophy: Trophy,
};

export default function StudentGamificationCard() {
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";
  const query = useQuery({
    queryKey: ["learning", "gamification-summary", studentUserId],
    queryFn: () => learningGamificationService.getStudentSummary(studentUserId),
    enabled: Boolean(studentUserId),
  });

  if (!user || query.isPending) return null;

  if (query.isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-white p-5" role="alert">
        <p className="font-bold text-slate-800">Your rewards could not be loaded.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-2 text-sm font-bold text-violet-800">
          <RefreshCw size={15} /> Try again
        </button>
      </section>
    );
  }

  const summary = query.data;
  const earnedBadges = summary.badges.filter((badge) => badge.earned);

  return (
    <section aria-labelledby="student-rewards-heading" className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_10px_35px_rgba(76,29,149,0.07)]">
      <div className="grid gap-5 bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider"><Sparkles size={14} /> Your learning rewards</p>
          <h2 id="student-rewards-heading" className="mt-3 text-2xl font-black tracking-tight">Level {summary.level} Explorer</h2>
          <p className="mt-1 text-sm text-violet-100">Earn XP by completing lessons and finishing evaluated assessments.</p>
        </div>
        <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 sm:min-w-36">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-100">Total XP</p>
          <p className="mt-1 text-4xl font-black tabular-nums">{summary.xp}</p>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-violet-100">
            <span>Level {summary.level}</span>
            <span>{summary.currentLevelXp}/100 XP to next level</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/20" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.currentLevelXp}>
            <div className="h-full rounded-full bg-[#ffe27a] transition-[width]" style={{ width: `${summary.currentLevelXp}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
        <RewardStat icon={<BookOpen size={18} />} label="Lessons completed" value={summary.completedLessons} tone="peach" />
        <RewardStat icon={<Target size={18} />} label="Assessments finished" value={summary.assessedQuizzes} tone="blue" />
        <RewardStat icon={<Medal size={18} />} label="Badges earned" value={earnedBadges.length} tone="mint" />
      </div>

      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-800">Badge collection</h3>
            <p className="mt-1 text-xs text-slate-500">Milestones unlock from recorded learning evidence.</p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700">{earnedBadges.length}/{summary.badges.length}</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.badges.map((badge) => <BadgeTile key={badge.id} badge={badge} />)}
        </div>
        <p className="mt-4 text-[11px] leading-5 text-slate-400">XP is calculated from validated lesson completions and evaluated assessments. Points are not awarded for opening pages or refreshing the dashboard.</p>
      </div>
    </section>
  );
}

function RewardStat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: "peach" | "blue" | "mint" }) {
  const tones = {
    peach: "bg-orange-50 text-orange-700",
    blue: "bg-sky-50 text-sky-700",
    mint: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span className={`rounded-xl p-2.5 ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function BadgeTile({ badge }: { badge: LearningBadge }) {
  const Icon = badgeIcons[badge.icon];
  return (
    <div className={`rounded-2xl border p-3 ${badge.earned ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badge.earned ? "bg-amber-200 text-amber-800" : "bg-white text-slate-400"}`}>
          {badge.earned ? <Icon size={20} /> : <Trophy size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-800">{badge.name}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{badge.description}</p>
        </div>
        {badge.earned && <CheckCircle2 size={17} className="shrink-0 text-emerald-600" aria-label="Earned" />}
      </div>
      {!badge.earned && <div className="mt-3"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Progress</span><span>{badge.progress}/{badge.goal}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-500" style={{ width: `${badge.progress / badge.goal * 100}%` }} /></div></div>}
    </div>
  );
}
