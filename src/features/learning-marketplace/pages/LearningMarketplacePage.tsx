import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";
import type { BookingRequest, DeliveryMode, EligibleStudent, Offering, TeacherOffering } from "../types/learning-marketplace.types";
import OfferingAvailability from "../components/OfferingAvailability";
import TeacherAvailabilityPanel from "../components/TeacherAvailabilityPanel";
import TeacherProfilePanel from "../components/TeacherProfilePanel";
import TeacherProfileSummary from "../components/TeacherProfileSummary";
import MarketplaceSafetyPanel from "../components/MarketplaceSafetyPanel";

const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm";
const label = "block text-sm font-medium text-slate-700";
export default function LearningMarketplacePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("English");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<DeliveryMode>("online");
  const [lessonType, setLessonType] = useState<"individual" | "group">("individual");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("500");
  const [currency, setCurrency] = useState("THB");
  const [packageLessons, setPackageLessons] = useState("1");
  const [grades, setGrades] = useState("M1, M2, M3");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const offerings = useQuery({ queryKey: ["marketplace","offerings"], queryFn: () => learningMarketplaceService.listOfferings(), enabled: Boolean(user?.id) });
  const orgs = useQuery({ queryKey: ["marketplace","orgs",user?.id], queryFn: () => learningMarketplaceService.listTeacherOrganizations(), enabled: Boolean(user?.id) });
  const mine = useQuery({ queryKey: ["marketplace","mine",user?.id], queryFn: () => learningMarketplaceService.listTeacherOfferings(), enabled: Boolean(user?.id) });
  const students = useQuery({ queryKey: ["marketplace","students",user?.id], queryFn: () => learningMarketplaceService.listEligibleStudents(), enabled: Boolean(user?.id) });
  const requests = useQuery({ queryKey: ["marketplace","requests",user?.id], queryFn: () => learningMarketplaceService.listBookingRequests(), enabled: Boolean(user?.id) });
  const refresh = async () => { await Promise.all([qc.invalidateQueries({queryKey:["marketplace","offerings"]}),qc.invalidateQueries({queryKey:["marketplace","mine",user?.id]}),qc.invalidateQueries({queryKey:["marketplace","requests",user?.id]})]); };
  const save = useMutation({ mutationFn: () => learningMarketplaceService.saveOffering({offeringId:editId,organizationId:orgId,title:title.trim(),subject:subject.trim(),description:description.trim(),deliveryMode:mode,lessonType,durationMinutes:Number(duration),priceAmount:Number(price),currencyCode:currency,packageLessons:Number(packageLessons),gradeLevels:grades.split(",").map(x=>x.trim()).filter(Boolean),status}), onSuccess: async () => { await refresh(); reset(); } });
  const book = useMutation({ mutationFn: learningMarketplaceService.createBookingRequest, onSuccess: refresh });
  const respond = useMutation({ mutationFn: learningMarketplaceService.respondToRequest, onSuccess: refresh });
  const cancel = useMutation({ mutationFn: learningMarketplaceService.cancelBookingRequest, onSuccess: refresh });
  function reset() { setEditId(null);setTitle("");setSubject("English");setDescription("");setMode("online");setLessonType("individual");setDuration("60");setPrice("500");setCurrency("THB");setPackageLessons("1");setGrades("M1, M2, M3");setStatus("published");setOrgId(orgs.data?.[0]?.organization_id ?? ""); }
  function edit(o: TeacherOffering) { setEditId(o.id);setOrgId(o.organization_id);setTitle(o.title);setSubject(o.subject);setDescription(o.description);setMode(o.delivery_mode);setLessonType(o.lesson_type);setDuration(String(o.duration_minutes));setPrice(String(o.price_amount));setCurrency(o.currency_code);setPackageLessons(String(o.package_lessons));setGrades(o.grade_levels.join(", "));setStatus(o.status);window.scrollTo({top:0,behavior:"smooth"}); }
  if (!user) return <p className="rounded-2xl border bg-white p-6">Sign in to explore extra classes.</p>;
  const own = mine.data ?? [];
  return <main className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-3xl bg-slate-950 p-7 text-white"><p className="text-sm font-semibold text-indigo-200">E&P Learning · Extra Classes</p><h1 className="mt-2 text-3xl font-bold">Find the right teacher</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Browse tutoring offers from active teachers, request lessons for yourself or a linked learner, and track responses. Payment is not collected in this first release.</p></header>
    <div className="flex justify-end">
      <Link to="/notifications" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Notification inbox
      </Link>
    </div>
    <TeacherAvailabilityPanel />
    <TeacherProfilePanel />
    {save.isError && <Error message={save.error.message} />}{book.isError && <Error message={book.error.message} />}{respond.isError && <Error message={respond.error.message} />}{cancel.isError && <Error message={cancel.error.message} />}
    {orgs.data && orgs.data.length > 0 && <section className="rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">{editId ? "Edit tutoring offer" : "Offer extra classes"}</h2><p className="mt-1 text-sm text-slate-500">Only active teachers assigned to the selected school can manage listings.</p>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={e=>{e.preventDefault();save.mutate();}}>
        <label className={label}>School<select className={field} value={orgId} onChange={e=>setOrgId(e.target.value)} required>{orgs.data.map(o=><option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}</select></label>
        <label className={label}>Offer title<input className={field} value={title} onChange={e=>setTitle(e.target.value)} minLength={5} maxLength={120} required/></label>
        <label className={label}>Subject<input className={field} value={subject} onChange={e=>setSubject(e.target.value)} minLength={2} maxLength={80} required/></label>
        <label className={label}>Grade / levels<input className={field} value={grades} onChange={e=>setGrades(e.target.value)} placeholder="M1, Grade 10"/></label>
        <label className={label}>Delivery<select className={field} value={mode} onChange={e=>setMode(e.target.value as DeliveryMode)}><option value="online">Online</option><option value="in_person">In person</option><option value="hybrid">Online or in person</option></select></label>
        <label className={label}>Class type<select className={field} value={lessonType} onChange={e=>setLessonType(e.target.value as "individual"|"group")}><option value="individual">Individual tutoring</option><option value="group">Group tutoring</option></select></label>
        <label className={label}>Duration<select className={field} value={duration} onChange={e=>setDuration(e.target.value)}>{[30,45,60,90,120,180,240].map(x=><option key={x} value={x}>{x} minutes</option>)}</select></label>
        <div className="grid grid-cols-[1fr_100px] gap-3"><label className={label}>Package price<input className={field} type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required/></label><label className={label}>Currency<select className={field} value={currency} onChange={e=>setCurrency(e.target.value)}><option>THB</option><option>KES</option><option>USD</option></select></label></div>
        <label className={label}>Lessons per package<input className={field} type="number" min="1" max="100" value={packageLessons} onChange={e=>setPackageLessons(e.target.value)} required/></label>
        <label className={label}>Status<select className={field} value={status} onChange={e=>setStatus(e.target.value as "draft"|"published"|"archived")}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className={label + " md:col-span-2"}>Description<textarea className={field} rows={4} value={description} onChange={e=>setDescription(e.target.value)} minLength={20} maxLength={3000} required/></label>
        <div className="flex gap-2 md:col-span-2"><button disabled={save.isPending} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{save.isPending?"Saving…":editId?"Save changes":"Save offer"}</button>{editId && <button type="button" onClick={reset} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button>}</div>
      </form>
      {mine.isError && <Error message="Your listings could not be loaded."/>}
      {own.length>0 && <div className="mt-5 border-t pt-4"><h3 className="font-semibold">Your offers</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{own.map(o=><article key={o.id} className="rounded-xl border p-3"><p className="font-semibold">{o.title}</p><p className="text-xs text-slate-500">{o.organization_name} · {o.status}</p><button type="button" onClick={()=>edit(o)} className="mt-2 rounded-lg border px-3 py-1.5 text-xs font-semibold">Edit</button></article>)}</div></div>}
    </section>}
    <section><h2 className="text-2xl font-bold">Available tutoring</h2><p className="mb-4 mt-1 text-sm text-slate-500">Published offers from currently active teachers.</p>{offerings.isPending?<p className="rounded-xl border bg-white p-5">Loading offers…</p>:offerings.isError?<Error message="Tutoring offers could not be loaded."/>:(offerings.data??[]).length===0?<p className="rounded-xl border border-dashed bg-white p-7 text-sm text-slate-500">No published offers yet.</p>:<div className="grid gap-4 lg:grid-cols-2">{(offerings.data??[]).map(o=><OfferingCard key={o.id} offering={o} students={students.data??[]} onBook={input=>book.mutate(input)} pending={book.isPending}/>)}</div>}</section>
    <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Booking requests</h2><p className="mt-1 text-sm text-slate-500">Requesters see their own requests; teachers see requests for their listings.</p>{requests.isPending?<p className="mt-3 text-sm">Loading…</p>:requests.isError?<Error message="Booking requests could not be loaded."/>:(requests.data??[]).length===0?<p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No requests yet.</p>:<div className="mt-4 grid gap-3 lg:grid-cols-2">{(requests.data??[]).map(r=><RequestCard key={r.id} request={r} userId={user.id} onRespond={(status,note)=>respond.mutate({requestId:r.id,status,responseNote:note})} onCancel={reason=>cancel.mutate({requestId:r.id,reason})} pending={respond.isPending||cancel.isPending}/>)}</div>}</section>
    <MarketplaceSafetyPanel />
    <p className="text-xs leading-5 text-slate-500">A lesson becomes confirmed only when the teacher confirms a specific date/time that fits their active weekly availability and does not overlap another confirmed lesson. This release does not collect payments or provide independent teacher identity verification, refunds, payouts, reviews, or dispute handling. Do not include sensitive student details in messages.</p>
  </main>;
}
function OfferingCard({offering,students,onBook,pending}:{offering:Offering;students:EligibleStudent[];onBook:(x:{offeringId:string;studentUserId:string;message:string;preferredDate:string|null;preferredTime:string|null})=>void;pending:boolean}) {
  const [studentId,setStudentId]=useState("");const [message,setMessage]=useState("");const [date,setDate]=useState("");const [time,setTime]=useState("");
  const eligible=students.filter(s=>s.organization_id===offering.organization_id);
  return <article className="rounded-2xl border bg-white p-5"><p className="text-xs font-semibold uppercase text-indigo-700">{offering.subject} · {offering.organization_name}</p><h3 className="mt-2 text-xl font-bold">{offering.title}</h3><p className="mt-1 text-sm text-slate-500">Teacher: {offering.teacher_name}</p><TeacherProfileSummary organizationId={offering.organization_id} teacherUserId={offering.teacher_user_id} /><OfferingAvailability organizationId={offering.organization_id} teacherUserId={offering.teacher_user_id} /><p className="mt-3 whitespace-pre-line text-sm leading-6">{offering.description}</p><p className="mt-3 text-sm font-semibold">{Number(offering.price_amount).toLocaleString()} {offering.currency_code} · {offering.package_lessons} lesson(s)</p><p className="mt-1 text-xs text-slate-500">{offering.delivery_mode.replace("_"," ")} · {offering.lesson_type} · {offering.duration_minutes} minutes · {(offering.grade_levels??[]).join(", ")}</p>
  <form className="mt-4 space-y-3 border-t pt-4" onSubmit={e=>{e.preventDefault();onBook({offeringId:offering.id,studentUserId:studentId,message:message.trim(),preferredDate:date||null,preferredTime:time||null});}}>
    <label className={label}>Learner<select className={field} value={studentId} onChange={e=>setStudentId(e.target.value)} required><option value="">Select learner</option>{eligible.map(s=><option key={s.student_user_id} value={s.student_user_id}>{s.student_name}</option>)}</select></label>
    <div className="grid gap-3 sm:grid-cols-2"><label className={label}>Preferred date<input className={field} type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label className={label}>Preferred time<input className={field} type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label></div>
    <label className={label}>Message (optional)<textarea className={field} rows={2} value={message} onChange={e=>setMessage(e.target.value)} maxLength={2000}/></label>
    <button disabled={!studentId||!eligible.length||pending} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{eligible.length?"Request a lesson":"No linked learner in this school"}</button>
  </form></article>;
}
function RequestCard({request,userId,onRespond,onCancel,pending}:{request:BookingRequest;userId:string;onRespond:(status:"accepted"|"declined",note:string)=>void;onCancel:(reason:string)=>void;pending:boolean}) {
  const [note,setNote]=useState("");const canRespond=request.teacher_user_id===userId&&request.status==="requested";const canCancel=(request.requester_user_id===userId&&(request.status==="requested"||request.status==="accepted"))||(request.teacher_user_id===userId&&request.status==="accepted");
  return <article className="rounded-xl border p-4"><div className="flex justify-between gap-3"><p className="font-semibold">{request.offering_title}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{request.status === "accepted" ? "Confirmed" : request.status === "declined" ? "Declined" : request.status === "cancelled" ? "Cancelled" : "Requested"}</span></div><p className="mt-2 text-sm">Learner: {request.student_name} · Requested by: {request.requester_name}</p>{request.preferred_date&&<p className="mt-1 text-sm text-slate-500">Preferred: {request.preferred_date} {request.preferred_time??""}</p>}{request.message&&<p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">{request.message}</p>}{request.response_note&&<p className="mt-2 text-sm">Response: {request.response_note}</p>}{(canRespond||canCancel)&&<div className="mt-3 space-y-2"><label className={label}>{canRespond?"Response note":"Cancellation note (optional)"}<textarea className={field} rows={2} value={note} onChange={e=>setNote(e.target.value)} maxLength={1000}/></label><div className="flex flex-wrap gap-2">{canRespond&&<><button type="button" disabled={pending} onClick={()=>onRespond("accepted",note)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Confirm lesson</button><button type="button" disabled={pending} onClick={()=>onRespond("declined",note)} className="rounded-lg border px-3 py-2 text-xs font-semibold">Decline</button></>}{canCancel&&<button type="button" disabled={pending} onClick={()=>{if(window.confirm("Cancel this lesson request or confirmed lesson?"))onCancel(note);}} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">{request.status==="requested"?"Cancel request":"Cancel lesson"}</button>}</div></div>}</article>;
}
function Error({message}:{message:string}) { return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</p>; }
