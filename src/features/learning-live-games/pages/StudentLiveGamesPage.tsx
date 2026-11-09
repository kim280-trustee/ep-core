import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Gamepad2, LoaderCircle, Trophy, Users, XCircle } from "lucide-react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningLiveGamesService } from "../services/learning-live-games.service";

function readText(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  for (const key of ["text", "question", "content", "en"]) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  return "";
}

function readOptions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const raw = (value as Record<string, unknown>).options;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((option, index) => {
    if (typeof option === "string") return [{ key: String.fromCharCode(97 + index), label: option }];
    if (!option || typeof option !== "object") return [];
    const record = option as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key : typeof record.value === "string" ? record.value : String.fromCharCode(97 + index);
    const label = typeof record.label === "string" ? record.label : typeof record.text === "string" ? record.text : key;
    return [{ key, label }];
  });
}

export default function StudentLiveGamesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [joinCode, setJoinCode] = useState(() => new URLSearchParams(window.location.search).get("code")?.replace(/\D/g, "").slice(0, 6) ?? "");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, { selectedOptions: string[]; result: { is_correct: boolean; points_awarded: number } | null }>>({});
  const questionStartedAt = useRef<number | null>(null);
  const [clockNow, setClockNow] = useState(0);

  const playerQuery = useQuery({
    queryKey: ["learning", "live-games", "student-player", playerId],
    queryFn: () => learningLiveGamesService.getPlayer(playerId!),
    enabled: Boolean(playerId),
    refetchInterval: 8000,
  });
  const sessionId = playerQuery.data?.sessionId ?? "";
  const sessionQuery = useQuery({
    queryKey: ["learning", "live-games", "student-session", sessionId],
    queryFn: () => learningLiveGamesService.getSession(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 5000,
  });
  const questionQuery = useQuery({
    queryKey: ["learning", "live-games", "student-question", sessionId, sessionQuery.data?.currentQuestionIndex],
    queryFn: () => learningLiveGamesService.getCurrentQuestion(sessionId),
    enabled: Boolean(sessionId && sessionQuery.data?.status === "in_progress"),
    refetchInterval: 3000,
  });
  const participationQuery = useQuery({
    queryKey: ["learning", "live-games", "student-participation", playerId],
    queryFn: () => learningLiveGamesService.hasSubmittedAnswer(playerId!),
    enabled: Boolean(playerId && sessionQuery.data?.status === "completed"),
  });
  const playersQuery = useQuery({
    queryKey: ["learning", "live-games", "student-leaderboard", sessionId],
    queryFn: () => learningLiveGamesService.listPlayers(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase.channel("student-live-game-" + sessionId)
      .on("postgres_changes", { event: "*", schema: "public", table: "learning_live_game_sessions", filter: "id=eq." + sessionId }, () => {
        void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-session", sessionId] });
        void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-question", sessionId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "learning_live_game_players", filter: "session_id=eq." + sessionId }, () => {
        void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-leaderboard", sessionId] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient, sessionId]);

  const joinMutation = useMutation({
    mutationFn: () => learningLiveGamesService.joinSession(joinCode.trim()),
    onSuccess: (id) => {
      setPlayerId(id);
      setJoinCode("");
    },
  });
  const answerMutation = useMutation({
    mutationFn: (responseTimeMs: number) => {
      if (!questionQuery.data?.assessment_question_id || !selectedOptions.length) throw new Error(t("liveGames.chooseAnswer"));
      const answer = question?.question_type === "multiple_choice"
        ? { option_ids: selectedOptions }
        : { option_id: selectedOptions[0] };
      return learningLiveGamesService.submitAnswer(sessionId, questionKey, answer, responseTimeMs);
    },
    onError: () => { void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-question", sessionId] }); },
    onSuccess: (result) => {
      setAnswersByQuestion((current) => ({ ...current, [questionKey]: { selectedOptions, result } }));
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-leaderboard", sessionId] });
      void queryClient.invalidateQueries({ queryKey: ["learning", "live-games", "student-player", playerId] });
    },
  });

  const question = questionQuery.data;
  const options = readOptions(question?.configuration);
  const prompt = readText(question?.prompt);
  const questionKey = question?.assessment_question_id ?? "";
  const selectedOptions = answersByQuestion[questionKey]?.selectedOptions ?? [];
  const deadlineAt = question?.deadline_at ?? null;
  const timeRemaining = deadlineAt ? Math.max(0, Math.ceil((Date.parse(deadlineAt) - clockNow) / 1000)) : null;
  const answerResult = answersByQuestion[questionKey]?.result ?? null;

  useEffect(() => {
    questionStartedAt.current = null;
  }, [question?.current_question_index, sessionId]);

  useEffect(() => {
    if (!deadlineAt) return;
    setClockNow(Date.now());
    const interval = window.setInterval(() => setClockNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [deadlineAt]);

  const ownPlayer = playerQuery.data;
  const currentScore = ownPlayer?.score ?? 0;
  const isAnswered = Boolean(answerResult);

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">{t("studentDashboard.signIn")}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="rounded-2xl bg-slate-950 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-white/10 p-3"><Gamepad2 size={25} /></span>
          <div><p className="text-sm font-semibold text-indigo-200">E&P Learning</p><h1 className="text-2xl font-bold">{t("liveGames.studentTitle")}</h1><p className="mt-1 text-sm text-slate-300">{t("liveGames.studentSubtitle")}</p></div>
        </div>
      </header>

      {!playerId && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">{t("liveGames.joinTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("liveGames.joinDescription")}</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); joinMutation.mutate(); }}>
            <label className="sr-only" htmlFor="live-game-code">{t("liveGames.joinCode")}</label>
            <input id="live-game-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={joinCode} onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-center font-mono text-2xl font-bold tracking-[0.3em]" required />
            <button type="submit" disabled={joinCode.length !== 6 || joinMutation.isPending} className="min-h-12 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{joinMutation.isPending ? t("liveGames.joining") : t("liveGames.joinGame")}</button>
          </form>
          {joinMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{joinMutation.error.message}</p>}
        </section>
      )}

      {playerId && playerQuery.isPending && <div className="flex items-center gap-2 rounded-xl bg-white p-5 text-slate-600"><LoaderCircle className="animate-spin" size={18} />{t("common.loading")}</div>}
      {playerId && playerQuery.isError && <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="font-semibold">{t("liveGames.sessionLoadError")}</p><p className="mt-1 text-sm">{playerQuery.error.message}</p><button type="button" onClick={() => { setPlayerId(null); }} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold">{t("liveGames.leaveGame")}</button></section>}

      {playerId && playerQuery.isSuccess && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-sm text-slate-500">{t("liveGames.playingAs")}</p><h2 className="text-xl font-bold text-slate-950">{ownPlayer?.displayName ?? t("liveGames.studentTitle")}</h2></div>
              <div className="rounded-xl bg-amber-50 px-4 py-2 text-right"><p className="text-xs font-semibold text-amber-800">{t("liveGames.yourScore")}</p><p className="text-2xl font-black text-amber-950">{currentScore} {t("liveGames.points")}</p></div>
            </div>
            {sessionQuery.data?.status === "lobby" && <div className="mt-5 rounded-xl bg-indigo-50 p-5 text-center"><Users className="mx-auto text-indigo-700" size={28} /><h3 className="mt-2 font-bold text-indigo-950">{t("liveGames.waitingForTeacher")}</h3><p className="mt-1 text-sm text-indigo-800">{t("liveGames.waitingDescription")}</p></div>}
            {sessionQuery.data?.status === "in_progress" && questionQuery.isPending && <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-slate-600">{t("common.loading")}</div>}
            {sessionQuery.data?.status === "in_progress" && questionQuery.isError && <p role="alert" className="mt-4 text-sm text-red-700">{questionQuery.error.message}</p>}
            {sessionQuery.data?.status === "in_progress" && question && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-500"><span>{t("liveGames.question")} {question.current_question_index} / {question.total_questions}</span><span>{question.points ?? 0} {t("liveGames.points")}</span></div>
                {timeRemaining !== null && <div className={"mt-3 rounded-lg px-3 py-2 text-center text-sm font-bold " + (timeRemaining <= 5 ? "bg-red-100 text-red-800" : "bg-amber-50 text-amber-900")}>{t("liveGames.timeRemaining")}: {timeRemaining}s</div>}
                {question.question_type === "multiple_choice" && <p className="mt-3 text-sm font-semibold text-indigo-700">{t("liveGames.selectAllThatApply")}</p>}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: ((question.current_question_index / Math.max(question.total_questions, 1)) * 100) + "%" }} /></div>
                <h3 className="mt-5 text-xl font-bold leading-relaxed text-slate-950">{prompt}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {options.map((option, index) => (
                    <button key={option.key} type="button" disabled={isAnswered || answerMutation.isPending || timeRemaining === 0} onClick={() => { if (questionStartedAt.current === null) questionStartedAt.current = Date.now(); setAnswersByQuestion((current) => { const previous = current[questionKey]?.selectedOptions ?? []; const next = question?.question_type === "multiple_choice" ? (previous.includes(option.key) ? previous.filter((key) => key !== option.key) : [...previous, option.key]) : [option.key]; return { ...current, [questionKey]: { selectedOptions: next, result: current[questionKey]?.result ?? null } }; }); }} aria-pressed={selectedOptions.includes(option.key)} className={"min-h-16 rounded-xl border-2 p-4 text-left text-sm font-semibold transition " + (selectedOptions.includes(option.key) ? "border-indigo-600 bg-indigo-50 text-indigo-950" : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300")}>
                      <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">{String.fromCharCode(65 + index)}</span>{option.label}
                    </button>
                  ))}
                </div>
                {!isAnswered && <button type="button" disabled={!selectedOptions.length || answerMutation.isPending || timeRemaining === 0} onClick={() => answerMutation.mutate(Math.max(0, Date.now() - (questionStartedAt.current ?? Date.now())))} className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{answerMutation.isPending ? t("liveGames.submitting") : t("liveGames.submitAnswer")}</button>}
                {timeRemaining === 0 && !isAnswered && <p role="status" className="mt-3 text-center text-sm font-semibold text-red-700">{t("liveGames.timeExpired")}</p>}
                {answerMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{answerMutation.error.message}</p>}
                {answerResult && <div className={"mt-4 flex items-start gap-3 rounded-xl p-4 " + (answerResult.is_correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950")}>
                  {answerResult.is_correct ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  <div><p className="font-bold">{answerResult.is_correct ? t("liveGames.correctAnswer") : t("liveGames.incorrectAnswer")}</p><p className="mt-1 text-sm">{answerResult.points_awarded} {t("liveGames.pointsEarned")}</p><p className="mt-1 text-xs">{t("liveGames.waitForNextQuestion")}</p></div>
                </div>}
              </div>
            )}
            {sessionQuery.data?.status === "completed" && <div className="mt-5 rounded-xl bg-emerald-50 p-5 text-center"><Trophy className="mx-auto text-emerald-700" size={32} /><h3 className="mt-2 text-xl font-bold text-emerald-950">{t("liveGames.gameComplete")}</h3><p className="mt-1 text-sm text-emerald-800">{t("liveGames.finalScore")}: {currentScore} {t("liveGames.points")}</p>{participationQuery.data && <p className="mt-2 text-sm font-semibold text-emerald-900">{t("liveGames.participationXpReward")}</p>}</div>}
            {sessionQuery.data?.status === "cancelled" && <div className="mt-5 rounded-xl bg-slate-100 p-5 text-center"><h3 className="font-bold text-slate-900">{t("liveGames.gameCancelled")}</h3></div>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">{t("liveGames.leaderboard")}</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {(playersQuery.data ?? []).map((player, index) => <div key={player.id} className="flex items-center justify-between py-3 text-sm"><span className="font-medium text-slate-800">{index + 1}. {player.displayName}{player.id === playerId ? " (" + t("liveGames.you") + ")" : ""}</span><span className="font-bold tabular-nums text-slate-950">{player.score} {t("liveGames.points")}</span></div>)}
            </div>
          </section>
          <button type="button" onClick={() => { setPlayerId(null); setAnswersByQuestion({}); questionStartedAt.current = null; }} className="text-sm font-semibold text-slate-500 underline">{t("liveGames.leaveGame")}</button>
        </>
      )}
    </div>
  );
}
