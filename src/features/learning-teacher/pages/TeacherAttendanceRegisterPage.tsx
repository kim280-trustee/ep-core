import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningEnrollmentService } from "@/features/learning-enrollment/services/learning-enrollment.service";
import { learningAttendanceService } from "@/features/learning-school-admin/services/learning-attendance.service";
import type { LearningAttendanceStatus } from "@/features/learning-school-admin/types/learning-attendance.types";
import { learningTeacherService } from "../services/learning-teacher.service";

function localDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

const statuses: LearningAttendanceStatus[] = ["present", "absent", "late", "excused", "unmarked"];

export default function TeacherAttendanceRegisterPage() {
  const { classGroupId = "" } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [attendanceDate, setAttendanceDate] = useState(localDateKey(new Date()));
  const [statusByStudentId, setStatusByStudentId] = useState<Record<string, LearningAttendanceStatus>>({});
  const [noteByStudentId, setNoteByStudentId] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const registerQuery = useQuery({
    queryKey: ["learning", "teacher-attendance-register", user?.id, classGroupId, attendanceDate],
    enabled: Boolean(user?.id && classGroupId),
    queryFn: async () => {
      const classes = await learningTeacherService.listTeacherClasses(user!.id);
      const classInfo = classes.find((item) => item.classGroup.id === classGroupId);
      if (!classInfo) throw new Error(t("teacherAttendance.classAccessDenied"));
      const members = await learningEnrollmentService.listClassMembers(classGroupId, true);
      const students = members.filter((item) => item.membershipType === "student" && item.status === "active");
      const studentIds = students.map((item) => item.userId);
      const [profiles, register] = await Promise.all([
        studentIds.length
          ? supabase.from("users").select("id,name").in("id", studentIds).then(({ data, error }) => {
              if (error) throw error;
              return data ?? [];
            })
          : Promise.resolve([]),
        learningAttendanceService.getRegister(classInfo.membership.organizationId, classGroupId, attendanceDate),
      ]);
      const nameById = new Map(profiles.map((profile) => [profile.id, profile.name]));
      return {
        classInfo,
        students: students.map((student) => ({ ...student, name: nameById.get(student.userId) || t("teacherAttendance.student") })),
        register,
      };
    },
  });

  useEffect(() => {
    if (!registerQuery.data) return;
    setStatusByStudentId(registerQuery.data.register.statusByStudentId);
    setNoteByStudentId(registerQuery.data.register.noteByStudentId);
    setFormError("");
  }, [registerQuery.data]);

  const save = useMutation({
    mutationFn: async (submit: boolean) => {
      const data = registerQuery.data;
      if (!user?.id || !data) throw new Error(t("teacherAttendance.saveError"));
      if (data.register.sessionStatus === "submitted") throw new Error(t("teacherAttendance.alreadySubmitted"));
      if (submit && data.students.some((student) => (statusByStudentId[student.userId] ?? "unmarked") === "unmarked")) {
        throw new Error(t("teacherAttendance.markEveryone"));
      }
      await learningAttendanceService.saveRegister({
        tenantId: data.classInfo.membership.tenantId,
        organizationId: data.classInfo.membership.organizationId,
        classGroupId,
        attendanceDate,
        takenBy: data.classInfo.membership.userId,
        records: data.students.map((student) => ({
          studentUserId: student.userId,
          status: statusByStudentId[student.userId] ?? "unmarked",
          note: noteByStudentId[student.userId] ?? "",
        })),
      });
      if (submit) {
        const updated = await learningAttendanceService.getRegister(data.classInfo.membership.organizationId, classGroupId, attendanceDate);
        if (!updated.sessionId) throw new Error(t("teacherAttendance.sessionMissing"));
        await learningAttendanceService.submitRegister(updated.sessionId);
      }
      return submit;
    },
    onSuccess: async (submitted) => {
      setNotice(submitted ? t("teacherAttendance.submitted") : t("teacherAttendance.saved"));
      setFormError("");
      await queryClient.invalidateQueries({ queryKey: ["learning", "teacher-attendance-register", user?.id, classGroupId, attendanceDate] });
    },
    onError: (error: Error) => {
      setFormError(error.message);
      setNotice("");
    },
  });

  if (!user) return <Message text={t("teacherAttendance.signIn")} />;
  if (registerQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (registerQuery.isError || !registerQuery.data) return <Message text={registerQuery.error instanceof Error ? registerQuery.error.message : t("teacherAttendance.loadError")} />;

  const { classInfo, students, register } = registerQuery.data;
  const locked = register.sessionStatus === "submitted";
  const counts = students.reduce((total, student) => {
    const status = statusByStudentId[student.userId] ?? "unmarked";
    if (status !== "unmarked") total[status] += 1;
    return total;
  }, { present: 0, absent: 0, late: 0, excused: 0 });

  return <div className="mx-auto max-w-4xl space-y-6">
    <Link to={"/teacher/classes/" + classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />{t("teacherAttendance.backToClass")}</Link>
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-slate-300"><ClipboardCheck size={19} /><span className="text-sm font-semibold">{t("teacherAttendance.title")}</span></div>
      <h1 className="mt-2 text-2xl font-bold">{classInfo.classGroup.name}</h1>
      <p className="mt-1 text-sm text-slate-300">{classInfo.classGroup.code} · {t("teacherAttendance.subtitle")}</p>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="block max-w-xs text-sm font-semibold text-slate-700">{t("teacherAttendance.date")}
        <input type="date" value={attendanceDate} max={localDateKey(new Date())} onChange={(event) => { setAttendanceDate(event.target.value); setNotice(""); setFormError(""); }} disabled={locked} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Count label={t("teacherAttendance.present")} value={counts.present} />
        <Count label={t("teacherAttendance.absent")} value={counts.absent} />
        <Count label={t("teacherAttendance.late")} value={counts.late} />
        <Count label={t("teacherAttendance.excused")} value={counts.excused} />
      </div>
      {locked && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{t("teacherAttendance.locked")}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {formError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-950">{t("teacherAttendance.classRoster")}</h2><p className="mt-1 text-sm text-slate-500">{t("teacherAttendance.rosterHelp")}</p></div>
      {students.length ? <div className="divide-y divide-slate-100">
        {students.map((student, index) => <article key={student.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <div><p className="text-xs font-semibold text-slate-400">{index + 1}</p><p className="font-semibold text-slate-900">{student.name}</p></div>
          <div className="grid grid-cols-2 gap-2">
            <select aria-label={t("teacherAttendance.statusFor") + " " + student.name} value={statusByStudentId[student.userId] ?? "unmarked"} disabled={locked} onChange={(event) => setStatusByStudentId((current) => ({ ...current, [student.userId]: event.target.value as LearningAttendanceStatus }))} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
              {statuses.map((status) => <option key={status} value={status}>{t("teacherAttendance.status." + status)}</option>)}
            </select>
            <input aria-label={t("teacherAttendance.noteFor") + " " + student.name} value={noteByStudentId[student.userId] ?? ""} disabled={locked} maxLength={240} onChange={(event) => setNoteByStudentId((current) => ({ ...current, [student.userId]: event.target.value }))} placeholder={t("teacherAttendance.optionalNote")} className="min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
          </div>
        </article>)}
      </div> : <p className="p-6 text-sm text-slate-500">{t("teacherAttendance.noStudents")}</p>}
    </section>

    {!locked && <div className="flex flex-wrap justify-end gap-3">
      <button type="button" disabled={save.isPending || !students.length} onClick={() => save.mutate(false)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 disabled:opacity-50"><Save size={17} />{save.isPending && save.variables === false ? t("teacherAttendance.saving") : t("teacherAttendance.saveDraft")}</button>
      <button type="button" disabled={save.isPending || !students.length} onClick={() => save.mutate(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={17} />{save.isPending && save.variables === true ? t("teacherAttendance.submitting") : t("teacherAttendance.submitRegister")}</button>
    </div>}
  </div>;
}

function Count({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p></div>;
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{text}</div>;
}
