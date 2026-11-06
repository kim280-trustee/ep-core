import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, FileText, Save, Send, Archive, ClipboardPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n";
import { Link, useNavigate, useParams } from "react-router-dom";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentStatus } from "@/features/learning-content";

const statusClasses: Record<LearningContentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  retired: "bg-red-100 text-red-700",
};

export default function TeacherContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [retiring, setRetiring] = useState(false);
  const [preview, setPreview] = useState(false);

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const organizationId = classes.data?.[0]?.membership.organizationId;

  const content = useQuery({
    queryKey: ["learning", "content", id],
    queryFn: async () => {
      const items = await learningContentService.listContent(organizationId);
      const item = items.find((candidate) => candidate.id === id);
      if (!item) throw new Error("Content item not found.");
      return item;
    },
    enabled: Boolean(id && organizationId),
  });

  const versions = useQuery({
    queryKey: ["learning", "content-versions", id],
    queryFn: () => learningContentService.listContentVersions(id!),
    enabled: Boolean(id && organizationId),
  });

  const objectives = useQuery({
    queryKey: ["learning", "content-objectives", id],
    queryFn: () => learningContentService.listContentObjectives(id!),
    enabled: Boolean(id && organizationId),
  });

  const latestVersion = versions.data?.[0];

  const latestBody = useMemo(() => {
    if (!latestVersion?.body) return "";
    const sections = Array.isArray(latestVersion.body.sections)
      ? latestVersion.body.sections
      : [];
    return sections
      .map((section) => {
        if (!section || typeof section !== "object") return "";
        const value = (section as Record<string, unknown>).body;
        return typeof value === "string" ? value : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }, [latestVersion]);

  const currentBody = bodyEdited ? body : latestBody;
  const item = content.data;
  const isRetired = item?.status === "retired";
  const isPublished = item?.status === "published";
  const isReview = item?.status === "review";
  const isDraft = item?.status === "draft";

  async function saveVersion(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A current content version is required before saving.");
      return;
    }
    if (isRetired) {
      setError("Retired content cannot be edited.");
      return;
    }
    if (!currentBody.trim()) {
      setError("Learning content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await learningContentService.createVersion({
        contentItemId: id,
        versionNo: latestVersion.versionNo + 1,
        body: {
          sections: [{ type: "text", title: "Content", body: currentBody.trim() }],
        },
        changeSummary: changeSummary.trim() || "Updated content",
        createdBy: user.id,
      });

      if (!isDraft) {
        await learningContentService.updateContentStatus(id, "draft", user.id);
      }

      setBody("");
      setBodyEdited(false);
      setChangeSummary("");
      await Promise.all([
        versions.refetch(),
        content.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the new version.");
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A content version is required before review.");
      return;
    }
    if (!isDraft) {
      setError("Only draft content can be submitted for review.");
      return;
    }

    setReviewing(true);
    try {
      await learningContentService.updateContentStatus(id, "review", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this content for review.");
    } finally {
      setReviewing(false);
    }
  }

  async function publish() {
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A content version is required before publishing.");
      return;
    }
    if (!isReview) {
      setError("Content must be in review before it can be published.");
      return;
    }

    setPublishing(true);
    try {
      await learningContentService.updateContentStatus(id, "published", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish this content.");
    } finally {
      setPublishing(false);
    }
  }

  async function retire() {
    setError("");

    if (!user?.id || !id) {
      setError("A content item is required before retiring.");
      return;
    }
    if (!isPublished) {
      setError("Only published content can be retired.");
      return;
    }

    setRetiring(true);
    try {
      await learningContentService.updateContentStatus(id, "retired", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retire this content.");
    } finally {
      setRetiring(false);
    }
  }

  if (!user) return <Message text="Sign in to manage learning content." />;
  if (!id) return <Message text="No content item was selected." />;
  if (classes.isPending || content.isPending || versions.isPending || objectives.isPending) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (classes.isError || !organizationId || content.isError || versions.isError || objectives.isError || !content.data) {
    return <Message text="We could not load this content item." />;
  }

  const currentItem = content.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/teacher/content"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={t("contentDetail.back")}
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText size={18} />
              {t("contentDetail.teacherContent")}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{currentItem.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentItem.code} · {currentItem.languageCode.toUpperCase()}
            </p>
          </div>
        </div>
        <span className={"inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold " + statusClasses[currentItem.status]}>
          {t(`contentDetail.status.${currentItem.status}`)}
        </span>
      </header>

      {isPublished && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900">{t("contentDetail.reuse")}</h2>
              <p className="mt-1 text-sm text-emerald-800">{t("contentDetail.reuseHelp")}</p>
            </div>
            <Link
              to={"/teacher/assignments/new?contentId=" + currentItem.id}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <ClipboardPlus size={17} />
              Reuse in assignment
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Info label={t("contentDetail.type")} value={label(currentItem.contentType)} />
        <Info label={t("contentDetail.version")} value={latestVersion ? String(latestVersion.versionNo) : t("contentDetail.none")} />
        <Info label={t("contentDetail.objectives")} value={String(objectives.data?.length ?? 0)} />
      </section>

      {objectives.data?.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("contentDetail.objectives")}</h2>
          <div className="mt-4 space-y-2">
            {objectives.data.map((link) => (
              <div key={link.objectiveId} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {t("contentDetail.objective")} {link.sequenceNo}: {link.objectiveId}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {t("contentDetail.noObjective")}
        </section>
      )}

      {isRetired && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {t("contentDetail.retired")}
        </section>
      )}

      <form onSubmit={saveVersion} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isRetired ? t("contentDetail.versionHistory") : isPublished ? t("contentDetail.nextDraft") : t("contentDetail.editDraft")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isRetired
                  ? t("contentDetail.retiredReadOnly")
                  : isPublished
                    ? t("contentDetail.publishedHistory")
                    : isReview
                      ? t("contentDetail.reviewDraft")
                      : t("contentDetail.editLatest")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={17} />
              {preview ? t("contentDetail.hidePreview") : t("contentDetail.preview")}
            </button>
          </div>

          {!isRetired && (
            <>
              <textarea
                value={currentBody}
                onChange={(event) => {
                  setBodyEdited(true);
                  setBody(event.target.value);
                }}
                className="input mt-5 min-h-72 w-full resize-y"
                placeholder={t("contentDetail.writeContent")}
                required
              />

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t("contentDetail.changeSummary")}</span>
                <input
                  value={changeSummary}
                  onChange={(event) => setChangeSummary(event.target.value)}
                  className="input w-full"
                  placeholder={t("contentDetail.changePlaceholder")}
                />
              </label>
            </>
          )}

          {preview && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("contentDetail.preview")}</p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {currentBody || t("contentDetail.nothingPreview")}
              </div>
            </div>
          )}
        </section>

        {latestVersion && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">{t("contentDetail.versionHistory")}</h2>
            <div className="mt-4 space-y-2">
              {(versions.data ?? []).map((version) => (
                <div key={version.id} className="flex flex-col gap-1 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t("contentDetail.versionLabel")} {version.versionNo}</p>
                    <p className="text-xs text-slate-500">{version.changeSummary || t("contentDetail.noSummary")}</p>
                  </div>
                  <span className={"inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold " + statusClasses[version.status]}>
                    {t(`contentDetail.status.${version.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        {!isRetired && (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={saving || !currentBody.trim()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? t("contentDetail.saving") : t("contentDetail.saveVersion")}
            </button>

            {isDraft && (
              <button
                type="button"
                onClick={() => void submitForReview()}
                disabled={reviewing || !latestVersion || !objectives.data?.length}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <Send size={17} />
                {reviewing ? t("contentDetail.submitting") : t("contentDetail.sendReview")}
              </button>
            )}

            {isReview && (
              <button
                type="button"
                onClick={() => void publish()}
                disabled={publishing || !latestVersion || !objectives.data?.length}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <Send size={17} />
                {publishing ? t("contentDetail.publishing") : t("contentDetail.publish")}
              </button>
            )}

            {isPublished && (
              <button
                type="button"
                onClick={() => void retire()}
                disabled={retiring}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Archive size={17} />
                {retiring ? t("contentDetail.retiring") : t("contentDetail.retire")}
              </button>
            )}
          </div>
        )}
      </form>

      <button type="button" onClick={() => navigate("/teacher/content")} className="text-sm font-medium text-slate-500 hover:text-slate-900">
        Return to Content Library
      </button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
