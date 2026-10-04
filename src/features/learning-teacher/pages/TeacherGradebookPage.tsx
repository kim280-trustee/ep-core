import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAcademicService } from "@/features/learning-academic";
import { learningGradebookService } from "@/features/learning-gradebook";
import { learningTeacherService } from "../services/learning-teacher.service";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

export default function TeacherGradebookPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const [termId, setTermId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");

  const overviewQuery = useQuery({
    queryKey: ["learning", "teacher-gradebook-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
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
  }, [gradebookQuery.data?.entries, gradebookQuery.data?.termGrades, overviewQuery.data]);

  const selectedSubject = overviewQuery.data?.classInfo.subjects.find(
    (subject) => subject.id === classSubjectId,
  );
  const selectedTerm = termsQuery.data?.find((term) => term.id === termId);

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

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        Sign in to access the gradebook.
      </div>
    );
  }

  if (overviewQuery.isPending || termsQuery.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (overviewQuery.isError || termsQuery.isError) {
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
            <p className="text-sm text-slate-300">
              {classInfo.classGroup.code}
            </p>
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

      {gradebookQuery.isPending ? (
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
      ) : gradebookQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">
            Gradebook records could not be loaded.
          </p>
          <p className="mt-1 text-sm">
            The selected term or subject may not have gradebook data yet.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Student grade summary
              </h2>
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
            <h2 className="text-lg font-semibold text-slate-900">
              Gradebook records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Auditable scores recorded for the selected subject and term.
            </p>

            <div className="mt-4 space-y-3">
              {gradebookQuery.data.entries.length ? (
                gradebookQuery.data.entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {rows.find(
                            (row) =>
                              row.student.membership.userId === entry.studentUserId,
                          )?.student.name ?? "Student"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {entry.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.recordType} · {entry.sourceType} · Recorded{" "}
                          {formatDate(entry.recordedAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {entry.score} / {entry.maxScore}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {entry.percentage ?? 0}% ·{" "}
                          {entry.includedInGrade ? "Included" : "Excluded"}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
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
