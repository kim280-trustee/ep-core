import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BellRing, Megaphone, Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { LearningLanguageSelector } from "@/features/learning-shared/components/LearningLanguageSelector";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";
import { learningSchoolAnnouncementsService } from "@/features/learning-school-announcements";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function SchoolAnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const authorization = useAuthorization();
  const queryClient = useQueryClient();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [organizationChoice, setOrganizationChoice] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const organizationsQuery = useQuery({
    queryKey: ["school-announcements", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id && !authLoading && !authorization.loading && canManage),
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = organizations.some((item) => item.id === organizationChoice)
    ? organizationChoice : organizations[0]?.id ?? "";

  const classesQuery = useQuery({
    queryKey: ["school-announcements", "classes", organizationId],
    queryFn: () => learningAcademicService.listClassGroups(organizationId),
    enabled: Boolean(organizationId && canManage),
  });
  const classes = (classesQuery.data ?? []).filter((item) => item.status === "active");
  const validClassGroupId = classes.some((item) => item.id === classGroupId) ? classGroupId : "";

  const announcementsQuery = useQuery({
    queryKey: ["school-announcements", "list", organizationId],
    queryFn: () => learningSchoolAnnouncementsService.listManageable(organizationId),
    enabled: Boolean(organizationId && canManage),
  });

  const createMutation = useMutation({
    mutationFn: () => learningSchoolAnnouncementsService.createDraft({
      organizationId,
      classGroupId: validClassGroupId || null,
      title: title.trim(),
      body: body.trim(),
    }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setClassGroupId("");
      setFeedback({ kind: "success", text: t("schoolAdmin.draftSaved") });
      void queryClient.invalidateQueries({ queryKey: ["school-announcements", "list", organizationId] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const publishMutation = useMutation({
    mutationFn: (announcementId: string) => learningSchoolAnnouncementsService.publish(announcementId),
    onSuccess: () => {
      setFeedback({ kind: "success", text: t("schoolAdmin.announcementPublished") });
      void queryClient.invalidateQueries({ queryKey: ["school-announcements", "list", organizationId] });
    },
    onError: (error: Error) => setFeedback({ kind: "error", text: error.message }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!organizationId) {
      setFeedback({ kind: "error", text: t("schoolAdmin.selectSchoolBeforeAnnouncement") });
      return;
    }
    if (title.trim().length < 1 || title.trim().length > 120) {
      setFeedback({ kind: "error", text: t("schoolAdmin.titleLengthError") });
      return;
    }
    if (body.trim().length < 1 || body.trim().length > 3000) {
      setFeedback({ kind: "error", text: t("schoolAdmin.bodyLengthError") });
      return;
    }
    createMutation.mutate();
  };

  if (authLoading || authorization.loading) return <main className="mx-auto max-w-5xl p-6"><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /></main>;
  if (!user) return <main className="mx-auto max-w-5xl p-6">{t("schoolAdmin.signInAnnouncements")}</main>;
  if (!canManage) return <main className="mx-auto max-w-5xl p-6"><section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h1 className="font-bold">{t("schoolAdmin.accessRequired")}</h1><p className="mt-2 text-sm">{t("schoolAdmin.announcementPermissionDescription")}</p><Link to="/school-admin" className="mt-4 inline-flex font-semibold underline">{t("schoolAdmin.return")}</Link></section></main>;

  return <main className="mx-auto max-w-5xl space-y-6">
    <div className="flex justify-end"><LearningLanguageSelector compact /></div>
    <header>
      <Link to="/school-admin" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/> {t("schoolAdmin.setup")}</Link>
      <p className="mt-4 text-sm font-semibold text-indigo-700">{t("schoolAdmin.parentEngagement")}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{t("schoolAdmin.announcementsTitle")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("schoolAdmin.announcementsDescription")}</p>
    </header>

    {feedback && <div role={feedback.kind === "error" ? "alert" : "status"} className={feedback.kind === "error" ? "flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" : "flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"}>{feedback.kind === "error" ? <AlertCircle size={18} className="shrink-0"/> : <BellRing size={18} className="shrink-0"/>}<span>{feedback.text}</span></div>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Megaphone size={19}/> {t("schoolAdmin.createAnnouncement")}</h2>
      {organizationsQuery.isError ? <p role="alert" className="mt-4 text-sm text-rose-700">{t("schoolAdmin.schoolListError")} {t("schoolAdmin.refreshAndRetry")}</p>
      : !organizationsQuery.isPending && organizations.length === 0 ? <p className="mt-4 text-sm text-slate-600">{t("schoolAdmin.noManageableSchool")}</p>
      : <form onSubmit={submit} className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-slate-700">{t("schoolAdmin.schoolOrganization")}
          <select value={organizationId} onChange={(event) => { setOrganizationChoice(event.target.value); setClassGroupId(""); }} disabled={organizations.length <= 1} className={fieldClass}>
            {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">{t("schoolAdmin.audience")}
          <select value={validClassGroupId} onChange={(event) => setClassGroupId(event.target.value)} className={fieldClass}>
            <option value="">{t("schoolAdmin.allEligibleParents")}</option>
            {classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-slate-500">{t("schoolAdmin.classNoticeAudienceHelp")}</span>
        </label>
        <label className="block text-sm font-medium text-slate-700">{t("schoolAdmin.title")}
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required className={fieldClass} placeholder="e.g. Midterm examination reminder"/>
        </label>
        <label className="block text-sm font-medium text-slate-700">{t("schoolAdmin.announcement")}
          <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={3000} rows={5} required className={fieldClass} placeholder={t("schoolAdmin.announcementPlaceholder")}/>
          <span className="mt-1 block text-xs font-normal text-slate-500">{body.length}/3000 {t("schoolAdmin.characters")} {t("schoolAdmin.privacyReminder")}</span>
        </label>
        <button type="submit" disabled={!organizationId || createMutation.isPending || !title.trim() || !body.trim()} className={buttonClass}><Plus size={16}/>{createMutation.isPending ? t("schoolAdmin.savingDraft") : t("schoolAdmin.saveDraft")}</button>
      </form>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">{t("schoolAdmin.announcements")}</h2><p className="mt-1 text-sm text-slate-500">{t("schoolAdmin.announcementVisibilityHelp")}</p></div><span className="text-xs text-slate-500">{announcementsQuery.data?.length ?? 0} {t("schoolAdmin.notices")}</span></div>
      {announcementsQuery.isPending ? <p className="py-8 text-sm text-slate-500">{t("schoolAdmin.loadingAnnouncements")}</p>
      : announcementsQuery.isError ? <p role="alert" className="py-8 text-sm text-rose-700">{t("schoolAdmin.announcementsLoadError")}</p>
      : !announcementsQuery.data?.length ? <p className="py-8 text-sm text-slate-500">{t("schoolAdmin.noAnnouncements")}</p>
      : <div className="mt-4 space-y-3">{announcementsQuery.data.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-950">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.class_group_name ? t("schoolAdmin.classPrefix") + " " + item.class_group_name : t("schoolAdmin.schoolWide")} · {item.status === "published" ? t("schoolAdmin.published") : t("schoolAdmin.draft")} · {new Date(item.created_at).toLocaleString()}</p></div><span className={item.status === "published" ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800" : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"}>{item.status === "published" ? t("schoolAdmin.published") : t("schoolAdmin.draft")}</span></div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
        {item.status === "draft" && <button type="button" disabled={publishMutation.isPending} onClick={() => { setFeedback(null); publishMutation.mutate(item.id); }} className={buttonClass + " mt-4"}><Send size={16}/>{publishMutation.isPending ? t("schoolAdmin.publishing") : t("schoolAdmin.publishAnnouncement")}</button>}
      </article>)}</div>}
    </section>
    {classesQuery.isError && <p role="alert" className="text-sm text-rose-700">{t("schoolAdmin.classOptionsLoadError")}</p>}
  </main>;
}
