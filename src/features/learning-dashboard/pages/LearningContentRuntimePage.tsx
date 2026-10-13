import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningActivityService } from "@/features/learning-activity";
import { learningContentService } from "@/features/learning-content";

function textSections(body: Record<string, unknown>) {
  const raw = body.sections;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((section) => {
    if (!section || typeof section !== "object") return [];
    const record = section as Record<string, unknown>;
    const bodyText = typeof record.body === "string" ? record.body.trim() : "";
    if (!bodyText) return [];
    return [{
      title: typeof record.title === "string" ? record.title : null,
      body: bodyText,
    }];
  });
}

export default function LearningContentRuntimePage() {
  const { user } = useAuth();
  const { assignmentId, contentId } = useParams();
  const id = assignmentId ?? "";
  const content = contentId ?? "";
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState("");
  const [fillInAnswers, setFillInAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id || !id || !content) return;
    let active = true;
    void (async () => {
      try {
        await learningAssignmentsService.startForStudent(id, user.id);
        const session = await learningActivityService.startForStudent(user.id, "assignment", id);
        if (!active) return;
        await learningActivityService.logEvent({
          tenantId: session.tenantId,
          organizationId: session.organizationId,
          studentUserId: user.id,
          sessionId: session.id,
          activityType: "content_started",
          contentItemId: content,
          assignmentId: id,
        });
        await queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user.id] });
        await queryClient.invalidateQueries({ queryKey: ["learning", "progress", user.id] });
      } catch {
        // Content loading and completion surface actionable errors; starting activity is best-effort.
      }
    })();
    return () => { active = false; };
  }, [content, id, queryClient, user?.id]);

  const query = useQuery({
    queryKey: ["learning", "assignment-content", id, content, user?.id],
    queryFn: async () => {
      const result = await learningAssignmentsService.getStudentAssignment(id, user!.id);
      const item = result.items.find((candidate) => candidate.contentItemId === content);
      if (!item) throw new Error("This learning content is not part of the assignment.");
      if (item.itemType !== "content") throw new Error("This assignment item is not learning content.");

      const contentItems = await learningContentService.listContent(result.assignment.organizationId ?? undefined);
      const currentContent = contentItems.find((candidate) => candidate.id === content);
      if (!currentContent || currentContent.status !== "published") {
        throw new Error("This learning content is not available.");
      }

      const versions = await learningContentService.listContentVersions(content);
      const publishedVersion = versions.find((version) => version.status === "published");
      if (!publishedVersion) throw new Error("This learning content has no available version.");

      return {
        assignment: result.assignment,
        progress: result.progress,
        item,
        content: currentContent,
        version: publishedVersion,
        sections: textSections(publishedVersion.body),
      };
    },
    enabled: Boolean(id && content && user?.id),
  });

  const responseQuery = useQuery({
    queryKey: ["learning", "content-response", id, content, user?.id],
    queryFn: () => learningContentService.getStudentResponse(id, content, user!.id),
    enabled: Boolean(id && content && user?.id),
  });

  useEffect(() => {
    if (!responseQuery.data) return;
    const nextResponseText = responseQuery.data.responseText;
    const timer = window.setTimeout(() => {
      setResponseText(nextResponseText);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [responseQuery.data]);

  useEffect(() => {
    if (!responseQuery.data || !query.data) return;
    const template = query.data.sections.map((section) => section.body).join("\n\n");
    const parts = template.split(/(?:\\?_){3,}/g);
    if (parts.length < 2) return;
    const escapedParts = parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\  useEffect(() => {
    if (!responseQuery.data) return;
    const nextResponseText = responseQuery.data.responseText;
    const timer = window.setTimeout(() => {
      setResponseText(nextResponseText);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [responseQuery.data]);"));
    const matcher = new RegExp("^" + escapedParts.join("([\\s\\S]*?)") + "$");
    const match = responseQuery.data.responseText.match(matcher);
    if (match) setFillInAnswers(match.slice(1));
  }, [query.data, responseQuery.data]);

  const responseMutation = useMutation({
    mutationFn: async (status: "draft" | "submitted") => {
      if (!user?.id || !query.data) throw new Error("You must be signed in.");
      const text = responseText.trim();
      if (!text) throw new Error("Write your response before saving.");
      return learningContentService.saveStudentResponse({
        organizationId: query.data.assignment.organizationId, assignmentId: id, contentItemId: content,
        contentVersionId: query.data.version.id, studentUserId: user.id, responseText: text, status,
      });
    },
    onSuccess: async (saved) => {
      if (saved.status === "submitted") {
        const item = query.data?.item;
        if (item?.required) {
          await learningAssignmentsService.completeContentForStudent(id, content, user!.id);
        }
        void queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user?.id] });
        void queryClient.invalidateQueries({ queryKey: ["learning", "progress", user?.id] });
      }
      try {
        await responseQuery.refetch();
      } catch {
        // The response was saved; a refetch failure must not report the save as failed.
      }
    },
  });
  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("You must be signed in.");
      const wasCompleted = query.data?.progress?.status === "completed";
      const progress = await learningAssignmentsService.completeContentForStudent(id, content, user.id);

      if (!wasCompleted && progress.status === "completed") {
        try {
          const session = await learningActivityService.startForStudent(user.id, "assignment", id);
          await learningActivityService.logEvent({
            tenantId: session.tenantId,
            organizationId: session.organizationId,
            studentUserId: user.id,
            sessionId: session.id,
            activityType: "assignment_completed",
            assignmentId: id,
          });
        } catch {
          // Completion is persisted; assignment activity telemetry is best-effort.
        }
      }

      return progress;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "student-overview", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "progress", user?.id] });
    },
  });

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view this learning content.</div>;
  }

  if (query.isPending) {
    return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="h-72 animate-pulse rounded-2xl bg-slate-200" /></div>;
  }

  if (query.isError) {
    return (
      <div className="space-y-4">
        <Link to={`/learning/assignments/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <ArrowLeft size={16} />Back to assignment
        </Link>
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">This learning content could not be loaded.</p>
            <p className="mt-1 text-sm">{query.error instanceof Error ? query.error.message : "The content is not available to your account."}</p>
          </div>
        </div>
      </div>
    );
  }

  const { assignment, content: currentContent, version, sections } = query.data;
  const fillInPattern = /(?:\\?_){3,}/g;
  const isFillInActivity = sections.some((section) => fillInPattern.test(section.body));
  fillInPattern.lastIndex = 0;
  const buildFillInResponse = (answers: string[]) => {
    let answerIndex = 0;
    return sections.map((section) => section.body.replace(/(?:\\?_){3,}/g, () => answers[answerIndex++]?.trim() || "____")).join("\n\n");
  };
  let renderedBlankIndex = 0;

  return (
    <div className="space-y-6">

      <Link to={`/learning/assignments/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />Back to assignment
      </Link>

      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-white/10 p-3"><BookOpen size={22} /></span>
          <div>
            <p className="text-sm text-slate-300">Learning content</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{currentContent.title}</h1>
            <p className="mt-2 text-sm text-slate-300">{currentContent.code} · {currentContent.contentType}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</p>
            <p className="mt-1 font-medium text-slate-900">{assignment.title}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />Published content
          </span>
        </div>

        <div className="mt-6 space-y-6">
          {sections.length ? sections.map((section, index) => (
            <article key={`${version.id}-${index}`} className="space-y-2">
              {section.title && <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>}
              <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
                {isFillInActivity ? section.body.split(/((?:\\?_){3,})/g).map((part, partIndex) => {
                  if (!/(?:\\?_){3,}/.test(part)) return <span key={`${index}-text-${partIndex}`}>{part}</span>;
                  const answerIndex = renderedBlankIndex++;
                  return <input key={`${index}-blank-${answerIndex}`} aria-label={`Answer blank ${answerIndex + 1}`} value={fillInAnswers[answerIndex] ?? ""} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} onChange={(event) => {
                    const nextAnswers = [...fillInAnswers];
                    nextAnswers[answerIndex] = event.target.value;
                    setFillInAnswers(nextAnswers);
                    setResponseText(buildFillInResponse(nextAnswers));
                  }} className="mx-1 inline-block min-w-28 max-w-full rounded-md border border-slate-400 bg-white px-2 py-1 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" placeholder={`Blank ${answerIndex + 1}`} />
                }) : section.body}
              </div>
            </article>
          )) : (
            <p className="text-sm text-slate-500">This content version is currently empty.</p>
          )}
        </div>
      </section>

      {currentContent.contentType === "writing" || isFillInActivity ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">{isFillInActivity ? "Submit your completed activity" : "Your response"}</h2>
          <p className="mt-1 text-sm text-slate-500">{isFillInActivity ? "Fill in each blank in the content above, then save or submit your completed introduction." : "Write your answer below. You can save a draft and return later."}</p>
          {!isFillInActivity && <textarea value={responseText} onChange={e => setResponseText(e.target.value)} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} className="input mt-4 min-h-40 w-full resize-y" placeholder="Write your answer here..." />}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {responseQuery.data?.status === "submitted" ? <span className="text-sm font-medium text-emerald-700">Response submitted.</span> : <>
              <button type="button" disabled={!responseText.trim() || responseMutation.isPending} onClick={() => responseMutation.mutate("draft")} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Save draft</button>
              <button type="button" disabled={!responseText.trim() || responseMutation.isPending} onClick={() => responseMutation.mutate("submitted")} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{responseMutation.isPending ? "Submitting..." : "Submit response"}</button>
            </>}
          </div>
          {responseMutation.isError && <p className="mt-3 text-sm text-red-600">{responseMutation.error instanceof Error ? responseMutation.error.message : "Could not save your response."}</p>}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Complete this activity</h2><p className="mt-1 text-sm text-slate-500">Mark this required learning activity complete after you finish the lesson.</p></div><button type="button" disabled={completeMutation.isPending} onClick={() => completeMutation.mutate()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={17} />{completeMutation.isPending ? "Saving..." : "Mark as complete"}</button></div>
          {completeMutation.isSuccess && <p className="mt-3 text-sm font-medium text-emerald-700">Activity completed. Your assignment progress has been updated.</p>}
          {completeMutation.isError && <p className="mt-3 text-sm text-red-600">{completeMutation.error instanceof Error ? completeMutation.error.message : "Could not complete this activity."}</p>}
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <Link to={`/learning/assignments/${id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          <ArrowLeft size={17} />Return to assignment
        </Link>
      </div>
    </div>
  );
}