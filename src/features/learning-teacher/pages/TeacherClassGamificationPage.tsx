import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Gift, Trophy } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningRewardsService } from "@/features/learning-rewards";

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

  const classQuery = useQuery({
    queryKey: ["learning", "gamification", "class", classGroupId],
    queryFn: () => learningRewardsService.getClassContext(classGroupId),
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
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={18}/> Students cannot grant themselves XP. Challenge bonuses and reward redemptions are validated by database functions.</div>
  </div>;
}
