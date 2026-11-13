import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Radio, Trophy, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "@/core/i18n/useTranslation";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningAssessmentService } from "@/features/learning-assessment/services/learning-assessment.service";
import { learningRewardsService } from "@/features/learning-rewards";
import { learningLiveGamesService } from "../services/learning-live-games.service";

export default function TeacherLiveGamesPage() {
  const { classGroupId = "" } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [assessmentId, setAssessmentId] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);

  const classQuery = useQuery({
    queryKey: ["learning", "live-games", "class", classGroupId],
    queryFn: () => learningRewardsService.getClassContext(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const assessmentsQuery = useQuery({
    queryKey: ["learning", "live-games", "assessments", classQuery.data?.organization_id],
    queryFn: () => learningAssessmentService.listAssessments(classQuery.data!.organization_id),
    enabled: Boolean(classQuery.data?.organization_id),
  });
  const sessionsQuery = useQuery({
    queryKey: ["learning", "live-games", "sessions", classGroupId],
    queryFn: () => learningLiveGamesService.listClassSessions(classGroupId),
    enabled: Boolean(classGroupId),
    refetchInterval: 10000,
  });
  const activeSession = useMemo(
    () => (sessionsQuery.data ?? []).find((session) => session.status === "lobby" || session.status === "in_progress"),
    [sessionsQuery.data],
  );
  const playersQuery = useQuery({
    queryKey: ["learning", "live-games", "players", activeSession?.id],
    queryFn: () => learningLiveGamesService.listPlayers(activeSession!.id),
    enabled: Boolean(activeSession?.id),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!activeSession?.id) return;
    const channel = supabase.channel("live-game-" + activeSession.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "learning_live_game_sessions", filter: "id=eq." + activeSession.id }, () => {
        void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "sessions", classGroupId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "learning_live_game_players", filter: "session_id=eq." + activeSession.id }, () => {
        void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "players", activeSession.id] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [activeSession?.id, classGroupId, queryClient]);

  const createMutation = useMutation({
    mutationFn: () => learningLiveGamesService.createSession(classGroupId, assessmentId, timeLimitSeconds),
    onSuccess: () => {
      setAssessmentId("");
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "sessions", classGroupId] });
    },
  });
  const startMutation = useMutation({
    mutationFn: (id: string) => learningLiveGamesService.startSession(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "sessions", classGroupId] }),
  });
  const advanceMutation = useMutation({
    mutationFn: (id: string) => learningLiveGamesService.advanceQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "sessions", classGroupId] });
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "players", activeSession?.id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => learningLiveGamesService.cancelSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "sessions", classGroupId] });
    },
  });

  const publishedAssessments = (assessmentsQuery.data ?? []).filter((assessment) => assessment.status === "published");
  const isBusy = createMutation.isPending || startMutation.isPending || advanceMutation.isPending || cancelMutation.isPending;
  const studentJoinUrl = activeSession ? window.location.origin + "/learning/live-games?code=" + activeSession.joinCode : "";
  const qrImageUrl = studentJoinUrl ? "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=" + encodeURIComponent(studentJoinUrl) : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3"><Radio size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-indigo-200">E&P Learning</p>
            <h1 className="text-2xl font-bold">{t("liveGames.title")}</h1>
            <p className="mt-1 text-sm text-slate-300">{t("liveGames.subtitle")}</p>
          </div>
        </div>
      </header>

      {!activeSession && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">{t("liveGames.createTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("liveGames.createDescription")}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm">
              <option value="">{t("liveGames.chooseAssessment")}</option>
              {publishedAssessments.map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.title}</option>)}
            </select>
            <select aria-label={t("liveGames.timeLimit")} value={timeLimitSeconds} onChange={(event) => setTimeLimitSeconds(Number(event.target.value))} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value={0}>{t("liveGames.noTimeLimit")}</option><option value={15}>15 {t("liveGames.seconds")}</option><option value={30}>30 {t("liveGames.seconds")}</option><option value={45}>45 {t("liveGames.seconds")}</option><option value={60}>60 {t("liveGames.seconds")}</option><option value={90}>90 {t("liveGames.seconds")}</option><option value={120}>120 {t("liveGames.seconds")}</option></select>
            <button type="button" disabled={!assessmentId || isBusy} onClick={() => createMutation.mutate()} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {createMutation.isPending ? t("liveGames.creating") : t("liveGames.createGame")}
            </button>
          </div>
          {publishedAssessments.length === 0 && <p className="mt-3 text-sm text-amber-700">{t("liveGames.noPublishedAssessments")}</p>}
          {createMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{createMutation.error.message}</p>}
        </section>
      )}

      {activeSession && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t("liveGames.joinCode")}</p>
              <p className="mt-1 font-mono text-5xl font-black tracking-[0.18em] text-slate-950">{activeSession.joinCode}</p>
              <p className="mt-2 text-sm text-slate-500">{t("liveGames.shareCode")}</p>
              <p className="mt-2 text-xs text-slate-500">{t("liveGames.timeLimit")}: {Number(activeSession.settings.time_limit_seconds ?? 0) || t("liveGames.noTimeLimit")}{Number(activeSession.settings.time_limit_seconds ?? 0) ? " " + t("liveGames.seconds") : ""}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold capitalize text-slate-700">{t("liveGames.status." + activeSession.status)}</div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
            <img src={qrImageUrl} alt={t("liveGames.scanToJoin")} width={132} height={132} className="rounded-lg bg-white p-2" />
            <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{t("liveGames.scanToJoin")}</p><p className="mt-1 break-all text-xs text-slate-500">{studentJoinUrl}</p><button type="button" onClick={() => { void navigator.clipboard.writeText(studentJoinUrl); }} className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">{t("liveGames.copyJoinLink")}</button></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {activeSession.status === "lobby" && (
              <button type="button" disabled={isBusy} onClick={() => startMutation.mutate(activeSession.id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                <Play size={16} /> {t("liveGames.startGame")}
              </button>
            )}
            {activeSession.status === "in_progress" && (
              <button type="button" disabled={isBusy} onClick={() => advanceMutation.mutate(activeSession.id)} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {t("liveGames.nextQuestion")}
              </button>
            )}
          </div>
          {(startMutation.isError || advanceMutation.isError || cancelMutation.isError) && <p role="alert" className="mt-3 text-sm text-red-700">{(startMutation.error ?? advanceMutation.error ?? cancelMutation.error)?.message}</p>}
          <button type="button" disabled={isBusy} onClick={() => { if (window.confirm(t("liveGames.confirmEndGame"))) cancelMutation.mutate(activeSession.id); }} className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">{t("liveGames.endGame")}</button>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Users size={17} /> {t("liveGames.players")}</div>
              <p className="mt-1 text-3xl font-bold text-slate-950">{playersQuery.data?.length ?? 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Trophy size={17} /> {t("liveGames.question")}</div>
              <p className="mt-1 text-3xl font-bold text-slate-950">{activeSession.currentQuestionIndex}</p>
            </div>
          </div>
          <div className="mt-5">
            <h3 className="font-semibold text-slate-900">{t("liveGames.leaderboard")}</h3>
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {(playersQuery.data ?? []).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-slate-800">{index + 1}. {player.displayName}</span>
                  <span className="font-bold tabular-nums text-slate-950">{player.score} {t("liveGames.points")}</span>
                </div>
              ))}
              {!playersQuery.data?.length && <p className="px-4 py-4 text-sm text-slate-500">{t("liveGames.waitingForPlayers")}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">{t("liveGames.recentGames")}</h2>
        <div className="mt-3 space-y-2">
          {(sessionsQuery.data ?? []).filter((session) => session.status === "completed").slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-mono font-semibold">{session.joinCode}</span>
              <span className="capitalize text-slate-500">{t("liveGames.status." + session.status)}</span>
            </div>
          ))}
          {!sessionsQuery.data?.some((session) => session.status === "completed") && <p className="text-sm text-slate-500">{t("liveGames.noRecentGames")}</p>}
        </div>
      </section>
    </div>
  );
}
