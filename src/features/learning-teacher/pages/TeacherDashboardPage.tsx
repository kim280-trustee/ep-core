import { AlertCircle, ArrowRight, BookOpen, ClipboardList, Library, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
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
        <div className="flex gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">We could not load your classes.</p>
            <button className="mt-3 rounded-lg bg-white px-3 py-2 text-sm" onClick={() => void query.refetch()}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

  const classes = query.data;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-slate-300">Teacher Workspace</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Manage your teaching</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Prepare lessons, create assignments, and monitor student progress from one place.
        </p>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950">Your Classes</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a class to manage its assignments, students, and academic results.</p>
        </div>

        {classes.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((item) => (
              <article key={item.classGroup.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.classGroup.code}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{item.classGroup.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.subjects.length ? item.subjects.map((subject) => subject.subject.name).join(", ") : "No subjects assigned"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <Users size={20} />
                  </div>
                </div>

                <Link
                  to={"/teacher/classes/" + item.classGroup.id}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Open Class Workspace
                  <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No active classes are assigned to this teacher yet.
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950">Teaching Workflow</h2>
          <p className="mt-1 text-sm text-slate-500">Use these tools to prepare and deliver learning activities.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardTool
            to="/teacher/content"
            icon={Library}
            title="Content Library"
            description="Find and manage lessons and learning content."
            action="Open Content Library"
          />
          <DashboardTool
            to="/teacher/authoring"
            icon={BookOpen}
            title="Authoring"
            description="Create and prepare learning content for students."
            action="Open Authoring"
          />
          <DashboardTool
            to="/teacher/assignments/new"
            icon={ClipboardList}
            title="Create Assignment"
            description="Build an assignment and prepare it for students."
            action="Create Assignment"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pilot Testing</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Follow the complete learning workflow</h2>
            <p className="mt-1 text-sm text-slate-500">
              Content → Assignment → Publish → Student → Results → Gradebook
            </p>
          </div>
          {classes[0] && (
            <Link
              to={"/teacher/classes/" + classes[0].classGroup.id}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open Pilot Class
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardTool({
  to,
  icon: Icon,
  title,
  description,
  action,
}: {
  to: string;
  icon: typeof Library;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <Link to={to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          <Icon size={20} />
        </div>
        <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      <p className="mt-4 text-sm font-semibold text-slate-800">{action}</p>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}
