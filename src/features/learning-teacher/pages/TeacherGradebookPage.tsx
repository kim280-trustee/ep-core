import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAcademicService } from "@/features/learning-academic";
import {
  learningGradebookService,
  type LearningGradebookCategory,
  type LearningGradebookEntry,
} from "@/features/learning-gradebook";
import { learningTeacherService } from "../services/learning-teacher.service";

type ManualGradeFormState = {
  studentUserId: string;
  categoryId: string;
  title: string;
  score: string;
  maxScore: string;
  recordedAt: string;
  notes: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function nowDateTimeLocal() {
  return toDateTimeLocal(new Date().toISOString());
}

function weightedAverage(
  entries: Array<{
    percentage: number | null;
    weight: number;
    includedInGrade: boolean;
  }>,
) {
  const included = entries.filter(
    (entry) => entry.includedInGrade && entry.percentage !== null,
  );
  const totalWeight = included.reduce((sum, entry) => sum + entry.weight, 0);
  if (!totalWeight) return null;
  return (
    included.reduce(
      (sum, entry) => sum + (entry.percentage ?? 0) * entry.weight,
      0,
    ) / totalWeight
  );
}

function getRecordType(category: LearningGradebookCategory | undefined) {
  return category?.code === "midterm" || category?.code === "final"
    ? "exam"
    : "manual";
}

function getInitialCategoryId(categories: LearningGradebookCategory[]) {
  return (
    categories.find((category) => category.code === "midterm")?.id ??
    categories.find((category) => category.code !== "assessment")?.id ??
    ""
  );
}

function emptyManualForm(
  students: Array<{ membership: { userId: string } }>,
  categories: LearningGradebookCategory[],
): ManualGradeFormState {
  return {
    studentUserId: students[0]?.membership.userId ?? "",
    categoryId: getInitialCategoryId(categories),
    title: "",
    score: "",
    maxScore: "100",
    recordedAt: nowDateTimeLocal(),
    notes: "",
  };
}

export default function TeacherGradebookPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const queryClient = useQueryClient();
  const [termId, setTermId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [form, setForm] = useState<ManualGradeFormState>({
    studentUserId: "",
    categoryId: "",
    title: "",
    score: "",
    maxScore: "100",
    recordedAt: nowDateTimeLocal(),
    notes: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [workingEntryId, setWorkingEntryId] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["learning", "teacher-gradebook-class", user?.id, classGroupId],
    queryFn: () =>
      learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  const termsQuery = useQuery({
    queryKey: [
      "learning",
      "teacher-gradebook-terms",
      overviewQuery.data?.classInfo.classGroup.id,
    ],
    queryFn: async () => {
      const classInfo = overviewQuery.data!.classInfo;
      return learningAcademicService.listTerms(
        classInfo.classGroup.organizationId,
        classInfo.classGroup.academicYearId,
      );
    },
    enabled: Boolean(overviewQuery.data),
  });

  const categoriesQuery = useQuery({
    queryKey: [
      "learning",
      "teacher-gradebook-categories",
      overviewQuery.data?.classInfo.classGroup.organizationId,
    ],
    queryFn: () =>
      learningGradebookService.listCategories(
        overviewQuery.data!.classInfo.classGroup.organizationId,
      ),
    enabled: Boolean(overviewQuery.data),
  });

  useEffect(() => {
    if (!termId && termsQuery.data?.length) {
      setTermId(
        termsQuery.data.find((term) => term.status === "active")?.id ??
          termsQuery.data[0].id,
      );
    }
  }, [termId, termsQuery.data]);

  useEffect(() => {
    if (!classSubjectId && overviewQuery.data?.classInfo.subjects.length) {
      setClassSubjectId(overviewQuery.data.classInfo.subjects[0].id);
    }
  }, [classSubjectId, overviewQuery.data?.classInfo.subjects]);

  const gradebookQuery = useQuery({
    queryKey: [
      "learning",
      "teacher-gradebook",
      classGroupId,
      classSubjectId,
      termId,
    ],
    queryFn: async () => {
      const classInfo = overviewQuery.data!.classInfo;
      const input = {
        organizationId: classInfo.classGroup.organizationId,
        classGroupId,
        classSubjectId,
        termId,
      };
      const [entries, termGrades] = await Promise.all([
        learningGradebookService.listEntries(input),
        learningGradebookService.listTermGrades(input),
      ]);
      return { entries, termGrades };
    },
    enabled: Boolean(
      overviewQuery.data && classSubjectId && termId,
    ),
  });

  const rows = useMemo(() => {
    if (!overviewQuery.data) return [];
    const { students } = overviewQuery.data;
    const entries = gradebookQuery.data?.entries ?? [];
    const termGrades = gradebookQuery.data?.termGrades ?? [];

    return students.map((student) => {
      const studentEntries = entries.filter(
        (entry) => entry.studentUserId === student.membership.userId,
      );
      const termGrade = termGrades.find(
        (grade) => grade.studentUserId === student.membership.userId,
      );

      return {
        student,
        entries: studentEntries,
        average: weightedAverage(studentEntries),
        termGrade,
      };
    });
  }, [
    gradebookQuery.data?.entries,
    gradebookQuery.data?.termGrades,
    overviewQuery.data,
  ]);

  const selectedSubject = overviewQuery.data?.classInfo.subjects.find(
    (subject) => subject.id === classSubjectId,
  );
  const selectedTerm = termsQuery.data?.find((term) => term.id === termId);
  const categories = categoriesQuery.data ?? [];
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const recordCount = gradebookQuery.data?.entries.length ?? 0;
  const classAverage = useMemo(() => {
    const values = rows
      .map((row) => row.average)
      .filter((value): value is number => value !== null);
    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  }, [rows]);
  const finalizedCount = rows.filter(
    (row) => row.termGrade?.status === "finalized",
  ).length;

  const invalidateGradebook = () =>
    queryClient.invalidateQueries({
      queryKey: ["learning", "teacher-gradebook", classGroupId],
    });

  function openCreateForm() {
    const students = overviewQuery.data?.students ?? [];
    setEditingEntryId(null);
    setActionError(null);
    setForm(emptyManualForm(students, categories));
    setFormOpen(true);
  }

  useEffect(() => {
    if (!formOpen) return;
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [formOpen]);

  function openEditForm(entry: LearningGradebookEntry) {
    setEditingEntryId(entry.id);
    setActionError(null);
    setForm({
      studentUserId: entry.studentUserId,
      categoryId: entry.categoryId ?? "",
      title: entry.title,
      score: String(entry.score),
      maxScore: String(entry.maxScore),
      recordedAt: toDateTimeLocal(entry.recordedAt),
      notes:
        typeof entry.notes.text === "string"
          ? entry.notes.text
          : entry.comment ?? "",
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingEntryId(null);
    setActionError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !overviewQuery.data || !termId || !classSubjectId) return;

    const score = Number(form.score);
    const maxScore = Number(form.maxScore);
    if (!form.studentUserId) {
      setActionError("Select a student.");
      return;
    }
    if (!form.title.trim()) {
      setActionError("Enter a title.");
      return;
    }
    if (!Number.isFinite(score) || !Number.isFinite(maxScore)) {
      setActionError("Score and maximum score must be valid numbers.");
      return;
    }
    if (maxScore <= 0 || score < 0 || score > maxScore) {
      setActionError(
        "Score must be between zero and the maximum score, and the maximum score must be greater than zero.",
      );
      return;
    }
    if (!form.recordedAt) {
      setActionError("Choose a recorded date.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === form.categoryId,
    );

    setActionError(null);
    setWorkingEntryId(editingEntryId ?? "new");

    try {
      if (editingEntryId) {
        await learningGradebookService.updateManualEntry(editingEntryId, {
          categoryId: form.categoryId || null,
          title: form.title,
          recordType: getRecordType(selectedCategory),
          score,
          maxScore,
          weight: selectedCategory?.defaultWeight ?? 1,
          recordedAt: new Date(form.recordedAt).toISOString(),
          notes: form.notes.trim()
            ? { text: form.notes.trim() }
            : {},
          comment: null,
          updatedBy: user.id,
        });
      } else {
        const classInfo = overviewQuery.data.classInfo;
        await learningGradebookService.createManualEntry({
          tenantId: user.tenantId,
          organizationId: classInfo.classGroup.organizationId,
          termId,
          classGroupId,
          classSubjectId,
          studentUserId: form.studentUserId,
          categoryId: form.categoryId || null,
          title: form.title,
          recordType: getRecordType(selectedCategory),
          score,
          maxScore,
          weight: selectedCategory?.defaultWeight ?? 1,
          recordedAt: new Date(form.recordedAt).toISOString(),
          notes: form.notes.trim()
            ? { text: form.notes.trim() }
            : {},
          comment: null,
          createdBy: user.id,
        });
      }

      closeForm();
      await invalidateGradebook();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The gradebook record could not be saved.",
      );
    } finally {
      setWorkingEntryId(null);
    }
  }

  async function handleToggleIncluded(entry: LearningGradebookEntry) {
    if (!user) return;
    setActionError(null);
    setWorkingEntryId(entry.id);

    try {
      await learningGradebookService.setEntryIncludedInGrade(
        entry.id,
        !entry.includedInGrade,
        user.id,
      );
      await invalidateGradebook();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The gradebook record could not be updated.",
      );
    } finally {
      setWorkingEntryId(null);
    }
  }

  async function handleDelete(entry: LearningGradebookEntry) {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) {
      return;
    }

    setActionError(null);
    setWorkingEntryId(entry.id);

    try {
      await learningGradebookService.deleteManualEntry(entry.id);
      if (editingEntryId === entry.id) closeForm();
      await invalidateGradebook();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The gradebook record could not be deleted.",
      );
    } finally {
      setWorkingEntryId(null);
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        Sign in to access the gradebook.
      </div>
    );
  }

  if (
    overviewQuery.isPending ||
    termsQuery.isPending ||
    categoriesQuery.isPending
  ) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (overviewQuery.isError || termsQuery.isError || categoriesQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <div className="flex gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">The gradebook could not be loaded.</p>
            <p className="mt-1 text-sm">
              Check that you are assigned to this class and have academic-record
              access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { classInfo } = overviewQuery.data;
  const isSubmitting = workingEntryId === "new" || Boolean(editingEntryId && workingEntryId === editingEntryId);
  const manualCategories = categories.filter(
    (category) => category.code !== "assessment",
  );

  return (
    <div className="space-y-6">
      <Link
        to={"/teacher/classes/" + classGroupId}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to class
      </Link>

      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-white/10 p-3">
            <GraduationCap size={22} />
          </span>
          <div>
            <p className="text-sm text-slate-300">{classInfo.classGroup.code}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Gradebook</h1>
            <p className="mt-2 text-sm text-slate-300">
              {classInfo.classGroup.name}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Students" value={rows.length} />
        <Metric label="Gradebook records" value={recordCount} />
        <Metric
          label="Class average"
          value={classAverage === null ? "—" : Math.round(classAverage) + "%"}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Subject
            <select
              value={classSubjectId}
              onChange={(event) => setClassSubjectId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {classInfo.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject.name} ({subject.subject.code})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Term
            <select
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {(termsQuery.data ?? []).map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>{selectedSubject?.subject.name ?? "No subject selected"}</span>
          <span>•</span>
          <span>{selectedTerm?.name ?? "No term selected"}</span>
          <span>•</span>
          <span>
            {finalizedCount}/{rows.length} term grades finalized
          </span>
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {formOpen && (
        <section
          ref={formSectionRef}
          className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingEntryId ? "Edit manual score" : "Add manual score"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Record a teacher-entered score for the selected subject and term.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Student
              <select
                value={form.studentUserId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    studentUserId: event.target.value,
                  }))
                }
                disabled={Boolean(editingEntryId)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
                required
              >
                {overviewQuery.data?.students.map((student) => (
                  <option
                    key={student.membership.id}
                    value={student.membership.userId}
                  >
                    {student.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Category
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Other</option>
                {manualCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Midterm Exam"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Score
              <input
                type="number"
                min="0"
                step="any"
                value={form.score}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    score: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Maximum score
              <input
                type="number"
                min="0.01"
                step="any"
                value={form.maxScore}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    maxScore: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Recorded date
              <input
                type="datetime-local"
                value={form.recordedAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    recordedAt: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Notes
              <input
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Optional note"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Preview:{" "}
                {form.score && form.maxScore && Number(form.maxScore) > 0
                  ? (
                      (Number(form.score) / Number(form.maxScore)) *
                      100
                    ).toFixed(1) + "%"
                  : "—"}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingEntryId ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingEntryId ? "Save changes" : "Add score"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {gradebookQuery.isPending ? (
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
      ) : gradebookQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">Gradebook records could not be loaded.</p>
          <p className="mt-1 text-sm">
            The selected term or subject may not have gradebook data yet.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Student grade summary
                </h2>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                disabled={!overviewQuery.data?.students.length}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                Add manual score
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Average</th>
                    <th className="px-3 py-3">Term grade</th>
                    <th className="px-3 py-3">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.student.membership.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium text-slate-900">
                          {row.student.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.student.email}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-semibold text-slate-900">
                        {row.average === null
                          ? "—"
                          : Math.round(row.average) + "%"}
                      </td>
                      <td className="px-3 py-4">
                        {row.termGrade ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={13} />
                            {Math.round(
                              row.termGrade.overrideScore ?? row.termGrade.score,
                            )}
                            % · {row.termGrade.status}
                          </span>
                        ) : (
                          <span className="text-slate-500">Not recorded</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {row.entries.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!rows.length && (
                <p className="mt-4 text-sm text-slate-500">
                  No active students are enrolled in this class.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Gradebook records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Auditable scores recorded for the selected subject and term.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {gradebookQuery.data.entries.length ? (
                gradebookQuery.data.entries.map((entry) => {
                  const category = entry.categoryId
                    ? categoryMap.get(entry.categoryId)
                    : undefined;
                  const isManual = entry.sourceType === "manual";
                  const isWorking = workingEntryId === entry.id;
                  const noteText =
                    typeof entry.notes.text === "string"
                      ? entry.notes.text
                      : null;

                  return (
                    <article
                      key={entry.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {rows.find(
                              (row) =>
                                row.student.membership.userId ===
                                entry.studentUserId,
                            )?.student.name ?? "Student"}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {entry.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {entry.recordType} · {entry.sourceType} ·{" "}
                            {category?.name ?? "Other"} · Recorded{" "}
                            {formatDate(entry.recordedAt)}
                          </p>
                          {noteText && (
                            <p className="mt-2 text-sm text-slate-600">
                              Note: {noteText}
                            </p>
                          )}
                        </div>

                        <div className="flex items-end gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {entry.score} / {entry.maxScore}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {entry.percentage ?? 0}% ·{" "}
                              {entry.includedInGrade ? "Included" : "Excluded"}
                            </p>
                          </div>

                          {isManual && (
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  openEditForm(entry);
                                }}
                                className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleToggleIncluded(entry)}
                                disabled={Boolean(workingEntryId)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                {isWorking ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : entry.includedInGrade ? (
                                  "Exclude"
                                ) : (
                                  "Include"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(entry)}
                                disabled={Boolean(workingEntryId)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {!isManual && (
                        <p className="mt-3 text-xs text-slate-400">
                          Assessment-generated record · read-only
                        </p>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">
                  No gradebook records have been recorded for this subject and
                  term yet.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
