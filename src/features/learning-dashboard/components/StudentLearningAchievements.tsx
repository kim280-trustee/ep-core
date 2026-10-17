import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle2, RefreshCw, Sparkles, Target, Trophy } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningActivityService } from "@/features/learning-activity";
import { learningAssessmentService } from "@/features/learning-assessment";
import type { LearningActivityEvent } from "@/features/learning-activity";

type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
};

function localDayKey(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isValidatedCompletion(event: LearningActivityEvent): boolean {
  return event.activityType === "content_viewed"
    && event.metadata["completion"] === "completed"
    && event.metadata["source"] === "validated_completion_rpc"
    && Boolean(event.contentItemId);
}

async function getAchievementSummary(studentUserId: string) {
  const [events, attempts, results] = await Promise.all([
    learningActivityService.listValidatedContentCompletions(studentUserId),
    learningAssessmentService.listAttempts(studentUserId),
    learningAssessmentService.listResults(studentUserId),
  ]);

  const completions = events.filter(isValidatedCompletion);
  const lessonIds = new Set(completions.map((event) => event.contentItemId!).filter(Boolean));
  const resultByAttempt = new Map(results.map((result) => [result.attemptId, result]));
  const evaluatedAttempts = attempts.filter((attempt) =>
    attempt.status === "evaluated" && resultByAttempt.has(attempt.id),
  );
  const assessmentIds = new Set(evaluatedAttempts.map((attempt) => attempt.assessmentId));
  const evidenceCount = lessonIds.size + assessmentIds.size;
  const badges: Achievement[] = [
    { id: "first_steps", title: "First Steps", description: "Complete your first lesson or evaluated assessment.", progress: Math.min(evidenceCount, 1), goal: 1 },
    { id: "content_explorer", title: "Content Explorer", description: "Complete three different lessons.", progress: Math.min(lessonIds.size, 3), goal: 3 },
    { id: "assessment_achiever", title: "Assessment Achiever", description: "Finish three different evaluated assessments.", progress: Math.min(assessmentIds.size, 3), goal: 3 },
    { id: "learning_champion", title: "Learning Champion", description: "Build a record of ten distinct learning completions.", progress: Math.min(evidenceCount, 10), goal: 10 },
  ];

  const today = localDayKey(new Date());
  const todaysLessons = new Set(completions
    .filter((event) => localDayKey(event.occurredAt) === today)
    .map((event) => event.contentItemId!)
    .filter(Boolean));
  const todaysAssessments = new Set(evaluatedAttempts
    .filter((attempt) => localDayKey(resultByAttempt.get(attempt.id)!.evaluatedAt) === today)
    .map((attempt) => attempt.id));

  return {
    badges,
    todayActivities: todaysLessons.size + todaysAssessments.size,
    dailyGoal: 3,
  };
}

export default function StudentLearningAchievements() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["learning", "student-achievements", user?.id],
    queryFn: () => getAchievementSummary(user!.id),
    enabled: Boolean(user?.id),
  });

  if (!user || query.isPending) return null;

  if (query.isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-white p-5" role="alert">
        <p className="font-semibold text-slate-900">Learning achievements could not be loaded.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
          <RefreshCw size={15} /> Try again
        </button>
      </section>
    );
  }

  const { badges, todayActivities, dailyGoal } = query.data;
  const earned = badges.filter((badge) => badge.progress >= badge.goal).length;
  const questProgress = Math.min(todayActivities, dailyGoal);

  return (
    <section aria-labelledby="student-achievements-heading" className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-violet-700"><Sparkles size={16} /> Learning milestones</p>
          <h2 id="student-achievements-heading" className="mt-1 text-xl font-bold text-slate-900">Your achievements</h2>
          <p className="mt-1 text-sm text-slate-600">Milestones are calculated from saved lesson completions and evaluated assessment results.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-bold text-violet-800"><Award size={16} /> {earned}/{badges.length} earned</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge, index) => {
          const isEarned = badge.progress >= badge.goal;
          const Icon = index === 0 ? Sparkles : index === 1 ? CheckCircle2 : index === 2 ? Target : Trophy;
          return (
            <article key={badge.id} className={`rounded-xl border p-4 ${isEarned ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-lg p-2 ${isEarned ? "bg-white text-emerald-700" : "bg-white text-slate-500"}`}><Icon size={18} /></span>
                {isEarned && <span className="text-xs font-bold text-emerald-700">Earned</span>}
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{badge.title}</h3>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-600">{badge.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600"><span>Progress</span><span>{badge.progress}/{badge.goal}</span></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${isEarned ? "bg-emerald-500" : "bg-violet-500"}`} style={{ width: `${Math.min(100, badge.progress / badge.goal * 100)}%` }} /></div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-bold text-amber-950">Today’s mini quest</p><p className="mt-1 text-sm text-amber-900">Complete three distinct lessons or evaluated assessments today.</p></div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-amber-900">{questProgress}/{dailyGoal}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-amber-500" style={{ width: `${questProgress / dailyGoal * 100}%` }} /></div>
        <p className="mt-2 text-xs text-amber-900">{questProgress >= dailyGoal ? "Daily goal completed. Keep learning at your own pace." : `${dailyGoal - questProgress} more distinct learning ${dailyGoal - questProgress === 1 ? "activity" : "activities"} to reach today’s goal.`}</p>
      </div>
    </section>
  );
}
