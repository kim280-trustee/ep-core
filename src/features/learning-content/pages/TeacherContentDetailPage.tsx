import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, FileText, Save, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
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
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
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

  async function saveVersion(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A current content version is required before saving.");
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
      setBody("");
      setBodyEdited(false);
      setChangeSummary("");
      await versions.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the new version.");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A content version is required before publishing.");
      return;
    }
    if (!objectives.data?.length) {
      setError("Add at least one learning objective before publishing.");
      return;
    }
    if (!latestBody.trim()) {
      setError("The latest version has no learning content.");
      return;
    }

    setPublishing(true);
    try {
      await learningContentService.updateContentStatus(id, "published", user.id);
      await Promise.all([content.refetch(), versions.refetch()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish this content.");
    } finally {
      setPublishing(false);
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

  const item = content.data;
  const isPublished = item.status === "published";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/teacher/content"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Back to content library"
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText size={18} />
              Teacher Content
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{item.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {item.code} · {item.languageCode.toUpperCase()}
            </p>
          </div>
        </div>
        <span className={"inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold " + statusClasses[item.status]}>
          {item.status[0].toUpperCase() + item.status.slice(1)}
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Info label="Content type" value={label(item.contentType)} />
        <Info label="Current version" value={latestVersion ? String(latestVersion.versionNo) : "None"} />
        <Info label="Learning objectives" value={String(objectives.data?.length ?? 0)} />
      </section>

      {objectives.data?.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Learning objectives</h2>
          <div className="mt-4 space-y-2">
            {objectives.data.map((link) => (
              <div key={link.objectiveId} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Objective {link.sequenceNo}: {link.objectiveId}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          This content has no learning objective. Publishing is blocked until at least one objective is linked.
        </section>
      )}

      <form onSubmit={saveVersion} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isPublished ? "Create the next draft version" : "Edit current draft"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isPublished
                  ? "Published versions remain historical. Your changes become a new version."
                  : "Edit the latest learning content and save it as a new version."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={17} />
              {preview ? "Hide preview" : "Preview"}
            </button>
          </div>

          <textarea
            value={currentBody}
            onChange={(event) => { setBodyEdited(true); setBody(event.target.value); }}
            className="input mt-5 min-h-72 w-full resize-y"
            placeholder="Write the learning content..."
            required
          />

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Change summary</span>
            <input
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              className="input w-full"
              placeholder="Describe what changed in this version"
            />
          </label>

          {preview && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {currentBody || "Nothing to preview yet."}
              </div>
            </div>
          )}
        </section>

        {latestVersion && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Version history</h2>
            <div className="mt-4 space-y-2">
              {(versions.data ?? []).map((version) => (
                <div key={version.id} className="flex flex-col gap-1 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Version {version.versionNo}</p>
                    <p className="text-xs text-slate-500">{version.changeSummary || "No change summary"}</p>
                  </div>
                  <span className={"inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold " + statusClasses[version.status]}>
                    {version.status[0].toUpperCase() + version.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="submit"
            disabled={saving || !currentBody.trim()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save New Version"}
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishing || !objectives.data?.length || !latestVersion}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Send size={17} />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
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
