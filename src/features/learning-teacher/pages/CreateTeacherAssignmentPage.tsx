import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function CreateTeacherAssignmentPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get("contentId");
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });

  const selectedClass = classesQuery.data?.find((item) => item.classGroup.id === classGroupId);
  const organizationId = selectedClass?.membership.organizationId;
  const contentQuery = useQuery({
    queryKey: ["learning", "assignment-content", organizationId],
    queryFn: () => learningContentService.listContent(organizationId!),
    enabled: Boolean(organizationId && contentId),
  });
  const selectedContent = contentQuery.data?.find((item) => item.id === contentId);
  const contentReady = Boolean(selectedContent && selectedContent.status === "published");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !classGroupId || !title.trim() || !code.trim()) {
        throw new Error(t("teacherCreateAssignment.validationRequired"));
      }
      const selected = classesQuery.data?.find((item) => item.classGroup.id === classGroupId);
      if (!selected) throw new Error(t("teacherCreateAssignment.selectClass"));
      if (classSubjectId && !selected.subjects.some((subject) => subject.id === classSubjectId)) {
        throw new Error(t("teacherCreateAssignment.subjectMismatch"));
      }
      const dueDate = dueAt ? new Date(dueAt) : null;
      if (dueDate && !Number.isFinite(dueDate.getTime())) {
        throw new Error(t("teacherCreateAssignment.invalidDue"));
      }
      if (contentId && !contentReady) {
        throw new Error(t("teacherCreateAssignment.contentNotPublished"));
      }

      const assignment = await learningAssignmentsService.createAssignment({
        tenantId: selected.membership.tenantId,
        organizationId: selected.membership.organizationId,
        classSubjectId: classSubjectId || null,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || null,
        status: "draft",
        dueAt: dueDate?.toISOString() ?? null,
        createdBy: user.id,
      });
      await learningAssignmentsService.addTarget({
        tenantId: selected.membership.tenantId,
        organizationId: selected.membership.organizationId,
        assignmentId: assignment.id,
        targetType: "class",
        classGroupId: selected.classGroup.id,
        dueAt: dueDate?.toISOString() ?? null,
      });
      if (selectedContent) {
        await learningAssignmentsService.addItem({
          organizationId: selected.membership.organizationId,
          assignmentId: assignment.id,
          itemType: "content",
          contentItemId: selectedContent.id,
          sequenceNo: 1,
          required: true,
        });
      }
      return assignment;
    },
    onSuccess: (assignment) => {
      void queryClient.invalidateQueries({ queryKey: ["learning"] });
      navigate("/teacher/authoring?assignmentId=" + assignment.id);
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">{t("teacherCreateAssignment.signIn")}</div>;
  }
  if (classesQuery.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (classesQuery.isError) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{t("teacherCreateAssignment.loadError")}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/teacher" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} />
          {t("teacherCreateAssignment.back")}
        </Link>
      </div>

      <header>
        <p className="text-sm font-semibold text-slate-500">{t("teacherCreateAssignment.section")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("teacherCreateAssignment.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t("teacherCreateAssignment.intro")}
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">1</div>
          <div className="flex-1">
            <p className="font-semibold">{t("teacherCreateAssignment.details")}</p>
            <p className="text-slate-500">{t("teacherCreateAssignment.here")}</p>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white font-bold text-slate-500">2</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-700">{t("teacherCreateAssignment.reviewPublish")}</p>
            <p className="text-slate-500">{t("teacherCreateAssignment.nextAuthoring")}</p>
          </div>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          createMutation.mutate();
        }}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("teacherCreateAssignment.chooseClassStep")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("teacherCreateAssignment.classHelp")}</p>
          </div>
          <Field label={t("teacherCreateAssignment.class")} hint={t("teacherCreateAssignment.required")}>
            <select
              required
              value={classGroupId}
              onChange={(event) => {
                setClassGroupId(event.target.value);
                setClassSubjectId("");
              }}
              className="input"
            >
              <option value="">{t("teacherCreateAssignment.chooseClass")}</option>
              {classesQuery.data.map((item) => (
                <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>
              ))}
            </select>
          </Field>
          <Field label={t("teacherCreateAssignment.subject")} hint={t("teacherCreateAssignment.optional")}>
            <select
              value={classSubjectId}
              onChange={(event) => setClassSubjectId(event.target.value)}
              className="input"
              disabled={!selectedClass}
            >
              <option value="">{t("teacherCreateAssignment.noSubject")}</option>
              {selectedClass?.subjects.map((item) => (
                <option key={item.id} value={item.id}>{item.subject.name}</option>
              ))}
            </select>
          </Field>
        </section>

        <div className="border-t border-slate-200" />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("teacherCreateAssignment.detailsStep")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("teacherCreateAssignment.detailsHelp")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("teacherCreateAssignment.code")} hint={t("teacherCreateAssignment.required")}>
              <input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="E.g. ENG-M1-001" className="input" />
            </Field>
            <Field label={t("teacherCreateAssignment.due")} hint={t("teacherCreateAssignment.optional")}>
              <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="input" />
            </Field>
          </div>
          <Field label={t("teacherCreateAssignment.titleField")} hint={t("teacherCreateAssignment.required")}>
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="E.g. Introducing Yourself" className="input" />
          </Field>
          <Field label={t("teacherCreateAssignment.instructions")} hint={t("teacherCreateAssignment.optional")}>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder={t("teacherCreateAssignment.instructionsPlaceholder")} className="input" />
          </Field>
        </section>

        {contentId && (
          <>
            <div className="border-t border-slate-200" />
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t("teacherCreateAssignment.selectedContent")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("teacherCreateAssignment.contentHelp")}</p>
              </div>
              {!selectedClass && (
                <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <BookOpen size={20} className="mt-0.5 shrink-0" />
                  <p>{t("teacherCreateAssignment.chooseClassVerify")}</p>
                </div>
              )}
              {selectedClass && contentQuery.isPending && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{t("teacherCreateAssignment.checking")}</div>
              )}
              {selectedClass && contentQuery.isError && (
                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p>{t("teacherCreateAssignment.contentCheckError")}</p>
                </div>
              )}
              {selectedClass && !contentQuery.isPending && !contentQuery.isError && selectedContent && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <BookOpen size={21} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{selectedContent.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{selectedContent.code} · {selectedContent.contentType}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 size={16} />
                      {contentReady ? t("teacherCreateAssignment.publishedAttach") : t("teacherCreateAssignment.statusMustPublish") + selectedContent.status + t("teacherCreateAssignment.mustPublish")}
                    </p>
                    <Link to={`/teacher/content/${selectedContent.id}`} className="mt-2 block text-sm font-semibold text-slate-700 underline underline-offset-2">{t("teacherCreateAssignment.viewLesson")}</Link>
                  </div>
                </div>
              )}
              {selectedClass && !contentQuery.isPending && !contentQuery.isError && !selectedContent && (
                <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p>{t("teacherCreateAssignment.lessonNotFound")}</p>
                </div>
              )}
            </section>
          </>
        )}

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="border-t border-slate-200 pt-5">
          <button
            type="submit"
            disabled={createMutation.isPending || Boolean(contentId && !contentReady)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"
          >
            {createMutation.isPending ? "{t("teacherCreateAssignment.creating")}" : <><CheckCircle2 size={18} />{t("teacherCreateAssignment.createContinue")}</>}
          </button>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <ClipboardCheck size={17} className="mt-0.5 shrink-0" />
            {t("teacherCreateAssignment.draftNotice")}
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}
        {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
