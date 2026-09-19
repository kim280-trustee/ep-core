import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { TeacherNavigation } from "../components/TeacherNavigation";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherClassPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const query = useQuery({
    queryKey: ["learning", "teacher-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to continue.</div>;
  if (query.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">This class could not be loaded. Check that you are assigned to the class.</div>;

  const { classInfo, students, assignments } = query.data;
  return (
    <div className="space-y-6">
      <TeacherNavigation />
      <div><Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to classes</Link></div>
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">{classInfo.classGroup.code}</p>
        <h1 className="mt-1 text-2xl font-bold">{classInfo.classGroup.name}</h1>
        <p className="mt-2 text-sm text-slate-300">{classInfo.subjects.map((item) => item.subject.name).join(", ") || "No subjects assigned"}</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users size={18} />} label="Students" value={students.length} />
        <Stat icon={<Clock3 size={18} />} label="Assignments" value={assignments.length} />
        <Stat icon={<CheckCircle2 size={18} />} label="Completed work" value={assignments.reduce((sum, item) => sum + item.completedCount, 0)} />
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Students</h2>
          {students.length ? <div className="divide-y divide-slate-100">{students.map((student) => <div key={student.membership.id} className="py-3 first:pt-0 last:pb-0"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></div>)}</div> : <p className="text-sm text-slate-500">No active students are enrolled.</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">Assignments</h2><Link to="/teacher/assignments/new" className="text-sm font-medium text-slate-700 hover:text-slate-950">Create</Link></div>
          {assignments.length ? <div className="space-y-3">{assignments.map((item) => <div key={item.assignment.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-900">{item.assignment.title}</p><p className="mt-1 text-xs text-slate-500">{item.assignment.status}</p></div><span className="text-xs text-slate-500">{item.completedCount}/{item.studentCount} complete</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-900" style={{ width: (item.studentCount ? Math.round(item.completedCount / item.studentCount * 100) : 0) + "%" }} /></div><div className="mt-2 flex gap-3 text-xs text-slate-500"><span>Started {item.startedCount}</span><span>Overdue {item.overdueCount}</span></div></div>)}</div> : <p className="text-sm text-slate-500">No assignments have been created for this class.</p>}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}
