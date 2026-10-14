import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Gift, Trophy } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningRewardsService } from "@/features/learning-rewards";
import { learningTeacherService } from "../services/learning-teacher.service";

function localDateTimeValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function TeacherClassGamificationPage() {
  const { classGroupId = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [targetType, setTargetType] = useState<"assignments_completed" | "xp_earned">("assignments_completed");
  const [targetValue, setTargetValue] = useState("3");
  const [bonusXp, setBonusXp] = useState("25");
  const [endsAt, setEndsAt] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return localDateTimeValue(d); });
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCost, setItemCost] = useState("100");
  const [itemQuantity, setItemQuantity] = useState("");
  const [feedback, setFeedback] = useState("");
  const [schoolCompetitionTitle, setSchoolCompetitionTitle] = useState("");
  const [schoolCompetitionDescription, setSchoolCompetitionDescription] = useState("");
  const [schoolTargetType, setSchoolTargetType] = useState<"assignments_completed" | "xp_earned">("xp_earned");
  const [schoolTargetValue, setSchoolTargetValue] = useState("500");
  const [schoolBonusXp, setSchoolBonusXp] = useState("25");
  const [schoolStartsAt, setSchoolStartsAt] = useState(() => localDateTimeValue(new Date()));
  const [schoolEndsAt, setSchoolEndsAt] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 14); return localDateTimeValue(d); });

  const classQuery = useQuery({
    queryKey: ["learning", "gamification", "class", classGroupId],
    queryFn: () => learningRewardsService.getClassContext(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const leaderboardSettingQuery = useQuery({
    queryKey: ["learning", "gamification", "leaderboard-setting", classGroupId],
    queryFn: () => learningRewardsService.getClassLeaderboardEnabled(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const schoolCompetitionPermissionQuery = useQuery({
    queryKey: ["learning", "school-competition-permission", user?.id],
    queryFn: () => learningRewardsService.canManageSchoolCompetitions(),
    enabled: Boolean(user?.id),
  });
  const schoolCompetitionsQuery = useQuery({
    queryKey: ["learning", "school-competitions", classQuery.data?.organization_id],
    queryFn: () => learningRewardsService.listSchoolCompetitions(classQuery.data!.organization_id),
    enabled: Boolean(classQuery.data?.organization_id),
  });
  const schoolCompetitionStandingsQuery = useQuery({
    queryKey: ["learning", "school-competition-standings", classQuery.data?.organization_id, schoolCompetitionsQuery.data?.map(item => item.id)],
    queryFn: async () => Promise.all(
      (schoolCompetitionsQuery.data ?? [])
        .filter(item => item.status !== "ended")
        .map(async competition => ({
          competition,
          standings: await learningRewardsService.listSchoolCompetitionStandings(competition.id),
        })),
    ),
    enabled: Boolean(classQuery.data?.organization_id && schoolCompetitionsQuery.data),
  });
  const rosterQuery = useQuery({
    queryKey: ["learning", "teacher-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });
  const ledgerQuery = useQuery({
    queryKey: ["learning", "gamification", "ledger", classGroupId],
    queryFn: () => learningRewardsService.listClassLedger(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const challengesQuery = useQuery({
    queryKey: ["learning", "gamification", "challenges", classGroupId],
    queryFn: () => learningRewardsService.listClassChallenges(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const itemsQuery = useQuery({
    queryKey: ["learning", "gamification", "shop-items", classGroupId],
    queryFn: () => learningRewardsService.listShopItems([classGroupId], true),
    enabled: Boolean(classGroupId),
  });
  const redemptionsQuery = useQuery({
    queryKey: ["learning", "gamification", "redemptions", classGroupId],
    queryFn: () => learningRewardsService.listClassRedemptions(classGroupId),
    enabled: Boolean(classGroupId),
  });
  const itemById = useMemo(() => new Map((itemsQuery.data ?? []).map(item => [item.id, item])), [itemsQuery.data]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["learning", "gamification"] }),
      queryClient.invalidateQueries({ queryKey: ["learning", "rewards"] }),
    ]);
  };
  const changeLeaderboardVisibility = useMutation({
    mutationFn: (enabled: boolean) => learningRewardsService.setClassLeaderboardEnabled(classGroupId, enabled),
    onSuccess: async (enabled) => {
      setFeedback(enabled ? "Class XP standings are now visible to students." : "Class XP standings are hidden from students.");
      await invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Leaderboard visibility could not be updated."),
  });
  const createSchoolCompetition = useMutation({
    mutationFn: async () => {
      const group = classQuery.data;
      if (!group) throw new Error("Class details are not available.");
      return learningRewardsService.createSchoolCompetition({
        organizationId: group.organization_id,
        title: schoolCompetitionTitle.trim(),
        description: schoolCompetitionDescription.trim(),
        targetType: schoolTargetType,
        targetValue: Number(schoolTargetValue),
        bonusXp: Number(schoolBonusXp),
        startsAt: new Date(schoolStartsAt).toISOString(),
        endsAt: new Date(schoolEndsAt).toISOString(),
      });
    },
    onSuccess: async () => {
      setSchoolCompetitionTitle("");
      setSchoolCompetitionDescription("");
      setFeedback("School-wide competition created.");
      await invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "School-wide competition could not be created."),
  });
  const changeSchoolCompetitionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" | "ended" }) =>
      learningRewardsService.setSchoolCompetitionStatus(id, status),
    onSuccess: async () => {
      setFeedback("School-wide competition status updated.");
      await invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Competition status could not be updated."),
  });
  const createChallenge = useMutation({
    mutationFn: async () => {
      const group = classQuery.data;
      if (!group || !user?.id) throw new Error("Class details are not available.");
      await learningRewardsService.createClassChallenge({
        tenantId: group.tenant_id,
        organizationId: group.organization_id,
        classGroupId: group.id,
        title: challengeTitle.trim(),
        description: challengeDescription.trim(),
        targetType,
        targetValue: Number(targetValue),
        bonusXp: Number(bonusXp),
        endsAt: new Date(endsAt).toISOString(),
        createdBy: user.id,
      });
    },
    onSuccess: async () => {
      setChallengeTitle(""); setChallengeDescription(""); setFeedback("Class challenge created.");
      await invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Challenge could not be created."),
  });
  const createItem = useMutation({
    mutationFn: async () => {
      const group = classQuery.data;
      if (!group || !user?.id) throw new Error("Class details are not available.");
      await learningRewardsService.createShopItem({
        tenantId: group.tenant_id,
        organizationId: group.organization_id,
        classGroupId: group.id,
        name: itemName.trim(),
        description: itemDescription.trim(),
        costXp: Number(itemCost),
        quantityRemaining: itemQuantity.trim() ? Number(itemQuantity) : null,
        createdBy: user.id,
      });
    },
    onSuccess: async () => {
      setItemName(""); setItemDescription(""); setFeedback("Reward added to the student shop.");
      await invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Reward could not be added."),
  });
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approved" | "rejected" | "fulfilled" }) =>
      learningRewardsService.reviewRedemption(id, decision),
    onSuccess: async () => { setFeedback("Redemption updated."); await invalidate(); },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Redemption could not be updated."),
  });
  const changeChallengeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" | "ended" }) => {
      await learningRewardsService.updateClassChallengeStatus(id, status);
    },
    onSuccess: async () => { setFeedback("Challenge status updated."); await invalidate(); },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Challenge status could not be updated."),
  });
  const changeItemStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      await learningRewardsService.updateShopItemStatus(id, status);
    },
    onSuccess: async () => { setFeedback("Reward availability updated."); await invalidate(); },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Reward availability could not be updated."),
  });

  if (classQuery.isPending) return <div className="rounded-2xl bg-white p-6">Loading class gamification…</div>;
  if (classQuery.isError || !classQuery.data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Class gamification could not be loaded. Confirm that you are an active teacher in this class.</div>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><p className="text-sm font-medium text-slate-500">Teacher tools · {classQuery.data.name}</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Class gamification</h1><p className="mt-2 text-sm text-slate-600">Set shared challenges, offer class rewards, and review student redemption requests. Rewards are issued only from verified learning records.</p></header>
    {feedback && <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{feedback}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Student leaderboard visibility</h2>
          <p className="mt-1 text-sm text-slate-600">Choose whether students in this class can compare privacy-limited XP standings. Standings are hidden by default; teachers can still review class progress.</p>
        </div>
        {leaderboardSettingQuery.isPending ? (
          <span className="text-sm text-slate-500">Loading setting…</span>
        ) : leaderboardSettingQuery.isError ? (
          <span role="alert" className="text-sm text-red-700">Visibility setting could not be loaded.</span>
        ) : (
          <button
            type="button"
            onClick={() => changeLeaderboardVisibility.mutate(!(leaderboardSettingQuery.data ?? false))}
            disabled={changeLeaderboardVisibility.isPending}
            aria-pressed={leaderboardSettingQuery.data ?? false}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${leaderboardSettingQuery.data ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
          >
            {changeLeaderboardVisibility.isPending ? "Saving…" : leaderboardSettingQuery.data ? "Visible to students · Turn off" : "Hidden from students · Turn on"}
          </button>
        )}
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">School-wide class competition</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">Run a school campaign that compares classes using verified assignment completions or learning XP. Only class totals are shown; individual student names are not published on this board.</p>
        </div>
        {schoolCompetitionPermissionQuery.data && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">School administrator</span>}
      </div>
      {schoolCompetitionPermissionQuery.isError && <p role="alert" className="mt-3 text-sm text-red-700">Competition permissions could not be checked.</p>}
      {schoolCompetitionPermissionQuery.data === true && <form className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 lg:grid-cols-2" onSubmit={event => { event.preventDefault(); createSchoolCompetition.mutate(); }}>
        <label className="block text-sm font-medium">Competition title<input required minLength={3} maxLength={100} value={schoolCompetitionTitle} onChange={event => setSchoolCompetitionTitle(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
        <label className="block text-sm font-medium">Success condition<select value={schoolTargetType} onChange={event => setSchoolTargetType(event.target.value as typeof schoolTargetType)} className="mt-1 w-full rounded-lg border bg-white p-2.5"><option value="xp_earned">Earn class XP</option><option value="assignments_completed">Complete assignments as a class</option></select></label>
        <label className="block text-sm font-medium lg:col-span-2">Description<textarea rows={2} value={schoolCompetitionDescription} onChange={event => setSchoolCompetitionDescription(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">Target<input type="number" min={1} max={100000} required value={schoolTargetValue} onChange={event => setSchoolTargetValue(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
          <label className="block text-sm font-medium">Bonus XP per contributor<input type="number" min={5} max={100} required value={schoolBonusXp} onChange={event => setSchoolBonusXp(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">Starts<input type="datetime-local" required value={schoolStartsAt} onChange={event => setSchoolStartsAt(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
          <label className="block text-sm font-medium">Ends<input type="datetime-local" required min={schoolStartsAt} value={schoolEndsAt} onChange={event => setSchoolEndsAt(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2.5"/></label>
        </div>
        <div className="flex items-center justify-between gap-3 lg:col-span-2">
          <p className="text-xs text-slate-500">Bonus XP is awarded once to each student who contributed qualifying activity when their class reaches the target.</p>
          <button type="submit" disabled={createSchoolCompetition.isPending} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createSchoolCompetition.isPending ? "Publishing…" : "Create competition"}</button>
        </div>
      </form>}
      {schoolCompetitionPermissionQuery.data === false && <p className="mt-3 text-sm text-slate-500">School-wide competitions are managed by school administrators.</p>}
      {schoolCompetitionsQuery.isPending || schoolCompetitionStandingsQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading school competitions…</p> : schoolCompetitionsQuery.isError || schoolCompetitionStandingsQuery.isError ? <p role="alert" className="mt-4 text-sm text-red-700">School competitions could not be loaded.</p> : !(schoolCompetitionStandingsQuery.data ?? []).length ? <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">No active school-wide competitions right now.</p> : <div className="mt-4 space-y-5">
        {(schoolCompetitionStandingsQuery.data ?? []).map(({ competition, standings }) => <article key={competition.id} className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50 p-4">
            <div><h3 className="font-semibold text-slate-900">{competition.title}</h3><p className="mt-1 text-sm text-slate-600">{competition.description || "School-wide learning challenge"}</p><p className="mt-1 text-xs text-slate-500">Target: {competition.target_value} {competition.target_type === "xp_earned" ? "XP per class" : "completed assignments per class"} · +{competition.bonus_xp} XP to contributors · Ends {new Date(competition.ends_at).toLocaleString()}</p></div>
            {schoolCompetitionPermissionQuery.data === true && <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => changeSchoolCompetitionStatus.mutate({id:competition.id,status:competition.status === "paused" ? "active" : "paused"})} disabled={changeSchoolCompetitionStatus.isPending || competition.status === "ended"} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">{competition.status === "paused" ? "Resume competition" : "Pause competition"}</button>
              {competition.status !== "ended" && <button type="button" onClick={() => changeSchoolCompetitionStatus.mutate({id:competition.id,status:"ended"})} disabled={changeSchoolCompetitionStatus.isPending} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">End competition</button>}
            </div>}
          </div>
          {standings.length ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Assignments</th><th className="px-4 py-3">XP earned</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{standings.map(row=><tr key={row.class_group_id}><td className="px-4 py-3 font-semibold">#{row.rank}</td><td className="px-4 py-3 font-medium">{row.class_name}</td><td className="min-w-40 px-4 py-3"><div className="text-xs text-slate-600">{row.progress_value} / {row.target_value} ({row.progress_percent}%)</div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{width:row.progress_percent+"%"}}/></div></td><td className="px-4 py-3 tabular-nums">{row.completed_assignments}</td><td className="px-4 py-3 tabular-nums">{row.xp_earned}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.has_met_target ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{row.has_met_target ? "Target reached" : "In progress"}</span></td></tr>)}</tbody></table></div> : <p className="p-4 text-sm text-slate-500">Class standings appear when students join and earn learning XP.</p>}
        </article>)}
      </div>}
    </section>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><Trophy size={20}/><h2 className="text-lg font-semibold">Create a class challenge</h2></div>
        <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); createChallenge.mutate(); }}>
          <label className="block text-sm font-medium">Challenge title<input required minLength={3} maxLength={100} value={challengeTitle} onChange={e=>setChallengeTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="block text-sm font-medium">Instructions<textarea value={challengeDescription} onChange={e=>setChallengeDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="block text-sm font-medium">Success condition<select value={targetType} onChange={e=>setTargetType(e.target.value as typeof targetType)} className="mt-1 w-full rounded-lg border p-2.5"><option value="assignments_completed">Complete assignments</option><option value="xp_earned">Earn XP from verified learning</option></select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Target<input type="number" min={1} max={10000} required value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="block text-sm font-medium">Bonus XP (5–100)<input type="number" min={5} max={100} required value={bonusXp} onChange={e=>setBonusXp(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label></div>
          <label className="block text-sm font-medium">Challenge ends<input type="datetime-local" required min={localDateTimeValue(new Date())} value={endsAt} onChange={e=>setEndsAt(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <button disabled={createChallenge.isPending} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createChallenge.isPending?"Creating…":"Publish challenge"}</button>
        </form>
        <div className="mt-5 border-t pt-4"><h3 className="font-semibold">Current and past challenges</h3>{challengesQuery.isError?<p className="mt-2 text-sm text-red-700">Challenges could not be loaded.</p>:!challengesQuery.data?.length?<p className="mt-2 text-sm text-slate-500">No class challenges yet.</p>:<div className="mt-3 space-y-2">{challengesQuery.data.map(challenge=><div key={challenge.id} className="rounded-xl border p-3"><div className="flex justify-between gap-3"><p className="font-semibold">{challenge.title}</p><span className="text-xs text-slate-500">{challenge.status}</span></div><p className="mt-1 text-sm text-slate-600">{challenge.description || (challenge.target_value + " " + challenge.target_type.replaceAll("_"," "))} · +{challenge.bonus_xp} XP</p><p className="mt-1 text-xs text-slate-400">Ends {new Date(challenge.ends_at).toLocaleString()}</p>{challenge.status!=="ended"&&<button type="button" onClick={()=>changeChallengeStatus.mutate({id:challenge.id,status:challenge.status==="active"?"paused":"active"})} disabled={changeChallengeStatus.isPending} className="mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">{challenge.status==="active"?"Pause challenge":"Resume challenge"}</button>}{challenge.status!=="ended"&&<button type="button" onClick={()=>changeChallengeStatus.mutate({id:challenge.id,status:"ended"})} disabled={changeChallengeStatus.isPending} className="ml-2 mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">End challenge</button>}</div>)}</div>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><Gift size={20}/><h2 className="text-lg font-semibold">Student reward shop</h2></div>
        <form className="mt-4 space-y-3" onSubmit={event=>{event.preventDefault();createItem.mutate();}}>
          <label className="block text-sm font-medium">Reward name<input required minLength={2} maxLength={100} value={itemName} onChange={e=>setItemName(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="block text-sm font-medium">Description<textarea value={itemDescription} onChange={e=>setItemDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Cost in XP<input type="number" min={1} max={100000} required value={itemCost} onChange={e=>setItemCost(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="block text-sm font-medium">Stock (blank = unlimited)<input type="number" min={0} value={itemQuantity} onChange={e=>setItemQuantity(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label></div>
          <button disabled={createItem.isPending} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{createItem.isPending?"Saving…":"Add reward"}</button>
        </form>
        <div className="mt-5 border-t pt-4"><h3 className="font-semibold">Published rewards</h3>{itemsQuery.isError?<p className="mt-2 text-sm text-red-700">Rewards could not be loaded.</p>:!itemsQuery.data?.length?<p className="mt-2 text-sm text-slate-500">No rewards published yet.</p>:<div className="mt-3 space-y-2">{itemsQuery.data.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"><div><p className="font-semibold">{item.name} · {item.cost_xp} XP</p><p className="mt-1 text-xs text-slate-500">{item.quantity_remaining===null?"Unlimited stock":item.quantity_remaining+" remaining"} · {item.status}</p></div><button type="button" onClick={()=>changeItemStatus.mutate({id:item.id,status:item.status==="active"?"inactive":"active"})} disabled={changeItemStatus.isPending} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">{item.status==="active"?"Deactivate":"Activate"}</button></div>)}</div>}</div>
        <div className="mt-5 border-t pt-4"><h3 className="font-semibold">Redemption requests</h3>{redemptionsQuery.isError?<p className="mt-2 text-sm text-red-700">Requests could not be loaded.</p>:!redemptionsQuery.data?.length?<p className="mt-2 text-sm text-slate-500">No student requests yet.</p>:<div className="mt-3 space-y-2">{redemptionsQuery.data.map(redemption=><div key={redemption.id} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{itemById.get(redemption.item_id)?.name??"Reward"} · {redemption.cost_xp} XP</p><span className="text-xs capitalize text-slate-500">{redemption.status}</span></div><p className="mt-1 text-xs text-slate-500">Student {redemption.student_user_id.slice(0,8)} · {new Date(redemption.requested_at).toLocaleString()}</p>{redemption.status==="requested"&&<div className="mt-3 flex gap-2"><button type="button" onClick={()=>review.mutate({id:redemption.id,decision:"approved"})} disabled={review.isPending} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">Approve</button><button type="button" onClick={()=>review.mutate({id:redemption.id,decision:"rejected"})} disabled={review.isPending} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Reject</button></div>}{redemption.status==="approved"&&<button type="button" onClick={()=>review.mutate({id:redemption.id,decision:"fulfilled"})} disabled={review.isPending} className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Mark fulfilled</button>}</div>)}</div>}</div>
      </section>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Student challenge progress</h2>
          <p className="mt-1 text-sm text-slate-500">See each active challenge's verified progress for students in this class.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Teacher view</span>
      </div>
      {rosterQuery.isError || ledgerQuery.isError || challengesQuery.isError ? (
        <p role="alert" className="mt-4 text-sm text-red-700">Challenge progress could not be loaded. Refresh and try again.</p>
      ) : rosterQuery.isPending || ledgerQuery.isPending || challengesQuery.isPending ? (
        <p className="mt-4 text-sm text-slate-500">Loading student progress…</p>
      ) : (() => {
        const now = new Date().getTime();
        const activeChallenges = (challengesQuery.data ?? []).filter(challenge =>
          challenge.status === "active"
          && new Date(challenge.starts_at).getTime() <= now
          && new Date(challenge.ends_at).getTime() >= now
        );
        if (!activeChallenges.length) {
          return <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">Publish an active class challenge to see student-by-student progress here.</p>;
        }
        const students = rosterQuery.data?.students ?? [];
        const ledger = ledgerQuery.data ?? [];
        return <div className="mt-4 space-y-5">
          {activeChallenges.map(challenge => (
            <div key={challenge.id} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{challenge.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">Target: {challenge.target_value} {challenge.target_type === "assignments_completed" ? "completed assignments" : "class XP"} · Ends {new Date(challenge.ends_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">+{challenge.bonus_xp} XP</span>
              </div>
              {students.length ? <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(student => {
                      const evidence = ledger.filter(entry =>
                        entry.studentUserId === student.membership.userId
                        && entry.classGroupId === challenge.class_group_id
                        && entry.organizationId === challenge.organization_id
                        && entry.occurredAt >= challenge.starts_at
                        && entry.occurredAt <= challenge.ends_at
                      );
                      const completed = evidence.some(entry => entry.eventType === "challenge_completed" && entry.sourceId === challenge.id);
                      const rawProgress = challenge.target_type === "assignments_completed"
                        ? new Set(evidence.filter(entry => entry.eventType === "assignment_completed").map(entry => entry.sourceId)).size
                        : evidence.filter(entry => entry.eventType !== "challenge_completed").reduce((sum, entry) => sum + entry.xpDelta, 0);
                      const progress = Math.min(rawProgress, challenge.target_value);
                      const percent = Math.round((progress / challenge.target_value) * 100);
                      return <tr key={student.membership.userId}>
                        <td className="px-4 py-3"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td>
                        <td className="min-w-48 px-4 py-3">
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-600"><span>{progress} / {challenge.target_value}</span><span>{percent}%</span></div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={student.name + " progress for " + challenge.title} aria-valuemin={0} aria-valuemax={challenge.target_value} aria-valuenow={progress}><div className={`h-full rounded-full ${completed ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: percent + "%" }} /></div>
                        </td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{completed ? "Reward earned" : progress >= challenge.target_value ? "Awaiting reward record" : "In progress"}</span></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div> : <p className="p-4 text-sm text-slate-500">No active students are enrolled in this class.</p>}
            </div>
          ))}
        </div>;
      })()}
    </section>
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={18}/> Students cannot grant themselves XP. Challenge bonuses and reward redemptions are validated by database functions.</div>
  </div>;
}
