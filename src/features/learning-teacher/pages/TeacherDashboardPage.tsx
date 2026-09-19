import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { TeacherNavigation } from "../components/TeacherNavigation";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });

  if (!user) return <Empty text="Sign in to access the teacher workspace." />;
  if (query.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <div className="flex gap-3"><AlertCircle size={20} /><div><p className="font-semibold">We could not load your classes.</p><button className="mt-3 rounded-lg bg-white px-3 py-2 text-sm" onClick={() => void query.refetch()}>Try again</button></div></div>
      </div>
    );
  }

  const classes = query.data;
  return (
    <div className="space-y-6">
      <TeacherNavigation />
      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-slate-300">Teacher Workspace</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Your classes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Manage classes, assignments, and student progress from one place.</p>
      </section>
      {classes.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => (
            <Link key={item.classGroup.id} to={"/teacher/classes/" + item.classGroup.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.classGroup.code}</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{item.classGroup.name}</h2></div>
                <Users size={20} className="text-slate-400" />
              </div>
              <p className="mt-4 text-sm text-slate-500">{item.subjects.length ? item.subjects.map((subject) => subject.subject.name).join(", ") : "No subjects assigned"}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700"><BookOpen size={17} />Open class workspace</div>
            </Link>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No active classes are assigned to this teacher yet.</div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}
