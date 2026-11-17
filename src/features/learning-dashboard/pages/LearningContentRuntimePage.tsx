import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningActivityService } from "@/features/learning-activity";
import { learningContentService } from "@/features/learning-content";
import CodeActivityWorkspace from "../components/CodeActivityWorkspace";

function textSections(body: Record<string, unknown>) {
  const raw = body.sections;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((section) => {
    if (!section || typeof section !== "object") return [];
    const record = section as Record<string, unknown>;
    // Teacher-only pack guidance must never be included in student lesson content.
    const title = typeof record.title === "string" ? record.title.toLowerCase() : "";
    if (
      record.type === "teacher_only" ||
      record.audience === "teacher" ||
      /safety and teaching guidance|teacher guidance|teacher notes|teaching notes/.test(title)
    ) return [];
    const sectionType = typeof record.type === "string" ? record.type : "text";
    const bodyText = typeof record.body === "string" ? record.body.trim() : "";
    if (sectionType === "code_activity") {
      return [{
        type: sectionType,
        title: typeof record.title === "string" ? record.title : "Coding activity",
        body: bodyText,
        instructions: typeof record.instructions === "string" ? record.instructions : "",
        starterCode: typeof record.starterCode === "string" ? record.starterCode : "",
        requirements: "",
      }];
    }
    if (sectionType === "project_activity") {
      return [{
        type: sectionType,
        title: typeof record.title === "string" ? record.title : "Practical project",
        body: bodyText,
        instructions: typeof record.instructions === "string" ? record.instructions : bodyText,
        starterCode: "",
        requirements: typeof record.requirements === "string" ? record.requirements : "",
      }];
    }
    if (!bodyText) return [];
    return [{
      type: sectionType,
      title: typeof record.title === "string" ? record.title : null,
      body: bodyText,
      instructions: "",
      starterCode: "",
      requirements: "",
    }];
  });
}


const ALLOWED_PROJECT_FILE_TYPES = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain", "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function isValidHttpsUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function mutationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default function LearningContentRuntimePage() {
  const { user } = useAuth();
  const { assignmentId, contentId } = useParams();
  const id = assignmentId ?? "";
  const content = contentId ?? "";
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState("");
  const [codeDraft, setCodeDraft] = useState("");
  const [codeRunOutput, setCodeRunOutput] = useState("");
  const [codeRunSucceeded, setCodeRunSucceeded] = useState(false);
  const [projectUrl, setProjectUrl] = useState("");
  const [projectReflection, setProjectReflection] = useState("");
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [projectAttachments, setProjectAttachments] = useState<Array<{ path: string; name: string; size: number; type: string }>>([]);
  const [projectFileError, setProjectFileError] = useState("");
  const [fillInAnswerDrafts, setFillInAnswerDrafts] = useState<Record<string, string[]>>({});

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
    const structuredSection = query.data?.sections.find((section) => section.type === "code_activity" || section.type === "project_activity");
    if (!structuredSection) return;
    if (structuredSection.type === "code_activity") {
      let savedCode = structuredSection.starterCode;
      if (responseQuery.data?.responseText) {
        try {
          const saved = JSON.parse(responseQuery.data.responseText) as { code?: unknown; output?: unknown };
          if (typeof saved.code === "string") savedCode = saved.code;
          if (typeof saved.output === "string") setCodeRunOutput(saved.output);
        } catch {
          // Older free-text responses are not treated as executable code.
        }
      }
      setCodeDraft(savedCode);
      setCodeRunSucceeded(false);
    } else {
      try {
        const saved = JSON.parse(responseQuery.data?.responseText ?? "{}") as { url?: unknown; reflection?: unknown; attachments?: unknown };
        setProjectUrl(typeof saved.url === "string" ? saved.url : "");
        setProjectReflection(typeof saved.reflection === "string" ? saved.reflection : "");
        const attachments = Array.isArray(saved.attachments) ? saved.attachments.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const file = item as Record<string, unknown>;
          if (typeof file.path !== "string" || typeof file.name !== "string" || typeof file.size !== "number" || typeof file.type !== "string") return [];
          return [{ path: file.path, name: file.name, size: file.size, type: file.type }];
        }) : [];
        setProjectAttachments(attachments);
      } catch {
        setProjectUrl("");
        setProjectReflection("");
      }
    }
  }, [query.data, responseQuery.data]);

  const fillInDraftKey = `${id}:${content}`;
  const savedFillInAnswers = useMemo(() => {
    if (!responseQuery.data || !query.data) return [];
    const template = query.data.sections.map((section) => section.body).join("\n\n");
    const parts = template.split(/(?:\\?_){3,}/g);
    if (parts.length < 2) return [];
    const escapedParts = parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const matcher = new RegExp("^" + escapedParts.join("([\\s\\S]*?)") + "$");
    const match = responseQuery.data.responseText.match(matcher);
    return match ? match.slice(1) : [];
  }, [query.data, responseQuery.data]);
  const fillInAnswers = fillInAnswerDrafts[fillInDraftKey] ?? savedFillInAnswers;

  const responseMutation = useMutation({
    mutationFn: async (status: "draft" | "submitted") => {
      if (!user?.id || !query.data) throw new Error("You must be signed in.");
      // Fill-in activities keep their answers in the individual blank controls.
      // Build the persisted response from those controls instead of relying on the
      // separate free-text state, which is intentionally unused for fill-in lessons.
      let text = isCodingActivity
        ? JSON.stringify({ kind: "code_submission", language: "javascript", code: codeDraft.trim(), output: codeRunOutput })
        : isProjectActivity
          ? JSON.stringify({ kind: "project_submission", url: projectUrl.trim(), reflection: projectReflection.trim(), attachments: projectAttachments })
          : isFillInActivity ? buildFillInResponse(fillInAnswers).trim() : responseText.trim();
      if (isCodingActivity && (!codeDraft.trim() || !codeRunSucceeded)) {
        throw new Error("Run your code successfully before saving or submitting it.");
      }
      if (isProjectActivity && (!isValidHttpsUrl(projectUrl) || !projectReflection.trim())) {
        throw new Error("Enter a valid HTTPS project link and a short explanation of your work.");
      }
      if (!text || (isFillInActivity && !fillInComplete)) {
        throw new Error(isFillInActivity ? "Complete every blank before saving." : "Write your response before saving.");
      }
      const uploadedPaths: string[] = [];
      try {
        let attachments = [...projectAttachments];
        if (isProjectActivity && projectFiles.length) {
          if (attachments.length + projectFiles.length > 3) throw new Error("A project can include up to 3 files.");
          for (const file of projectFiles) {
            if (file.size > 15 * 1024 * 1024 || !ALLOWED_PROJECT_FILE_TYPES.has(file.type)) {
              throw new Error("Each file must be 15 MB or smaller and use an allowed document, image, text or ZIP format.");
            }
            const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-100) || "project-evidence";
            const objectPath = `${query.data.assignment.organizationId}/${id}/${content}/${user.id}/${crypto.randomUUID()}-${safeName}`;
            const { error } = await supabase.storage.from("learning-project-submissions").upload(objectPath, file, { contentType: file.type, upsert: false });
            if (error) throw error;
            uploadedPaths.push(objectPath);
            attachments.push({ path: objectPath, name: file.name, size: file.size, type: file.type });
          }
          text = JSON.stringify({ kind: "project_submission", url: projectUrl.trim(), reflection: projectReflection.trim(), attachments });
        }
        const saved = await learningContentService.saveStudentResponse({
          organizationId: query.data.assignment.organizationId, assignmentId: id, contentItemId: content,
          contentVersionId: query.data.version.id, studentUserId: user.id, responseText: text, status,
        });
        setProjectFiles([]);
        return saved;
      } catch (error) {
        if (uploadedPaths.length) {
          await supabase.storage.from("learning-project-submissions").remove(uploadedPaths).catch(() => undefined);
        }
        throw error;
      }
    },
    onSuccess: async (saved) => {
      // Refresh the response immediately after the database save. Completion is a
      // separate progress operation and must never make a successful submission
      // look like a failed response save.
      try {
        await responseQuery.refetch();
      } catch {
        // The response was saved; a refetch failure must not report the save as failed.
      }

      if (saved.status === "submitted") {
        void queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user?.id] });
        void queryClient.invalidateQueries({ queryKey: ["learning", "progress", user?.id] });
        const item = query.data?.item;
        if (item?.required) {
          try {
            await learningAssignmentsService.completeContentForStudent(id, content, user!.id);
          } catch (error) {
            // Submission has already succeeded. Keep it confirmed rather than
            // incorrectly showing "Could not save your response" for a progress error.
            console.error("Student response was submitted, but assignment progress could not be updated.", error);
          }
          void queryClient.invalidateQueries({ queryKey: ["learning", "assignment", id, user?.id] });
          void queryClient.invalidateQueries({ queryKey: ["learning", "progress", user?.id] });
        }
      }
    },
  });
  const handleCodeRunResult = useCallback((result: { output: string; success: boolean }) => {
    setCodeRunOutput(result.output);
    setCodeRunSucceeded(result.success);
  }, []);

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
  const isCodingActivity = sections.some((section) => section.type === "code_activity");
  const isProjectActivity = sections.some((section) => section.type === "project_activity");
  const projectSubmissionValid = isValidHttpsUrl(projectUrl) && Boolean(projectReflection.trim());
  const fillInPattern = /(?:\\?_){3,}/g;
  const isFillInActivity = !isCodingActivity && !isProjectActivity && sections.some((section) => fillInPattern.test(section.body));
  fillInPattern.lastIndex = 0;
  const buildFillInResponse = (answers: string[]) => {
    let answerIndex = 0;
    return sections.map((section) => section.body.replace(/(?:\\?_){3,}/g, () => answers[answerIndex++]?.trim() || "____")).join("\n\n");
  };
  const fillInBlankCount = sections.reduce((count, section) => count + (section.body.match(/(?:\\?_){3,}/g)?.length ?? 0), 0);
  const fillInComplete = fillInBlankCount > 0 && Array.from({ length: fillInBlankCount }, (_, index) => fillInAnswers[index]?.trim()).every(Boolean);
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
              {section.type === "code_activity" ? (
                <CodeActivityWorkspace
                  instructions={section.instructions || section.body}
                  starterCode={section.starterCode}
                  value={codeDraft}
                  disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending}
                  onChange={(nextCode) => { setCodeDraft(nextCode); setCodeRunOutput(""); setCodeRunSucceeded(false); }}
                  onRunResult={handleCodeRunResult}
                />
              ) : section.type === "project_activity" ? (
                <div className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.instructions}</p>
                  {section.requirements && <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Submission requirements</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">{section.requirements}</p></div>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Project link (HTTPS)
                      <input type="url" inputMode="url" value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} placeholder="https://..." className="input mt-1 w-full" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Explain what you created and how it works
                      <textarea value={projectReflection} onChange={(event) => setProjectReflection(event.target.value)} maxLength={4000} rows={4} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} className="input mt-1 w-full resize-y" placeholder="Describe your project and the work you completed." />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Attach project evidence (up to 3 files, 15 MB each)
                      <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.zip,.docx,.pptx,.xlsx" disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} onChange={(event) => {
                        const selected = Array.from(event.target.files ?? []);
                        setProjectFileError("");
                        if (projectAttachments.length + selected.length > 3) { setProjectFileError("A project can include up to 3 files."); event.target.value = ""; return; }
                        const invalid = selected.find((file) => file.size > 15 * 1024 * 1024 || !ALLOWED_PROJECT_FILE_TYPES.has(file.type));
                        if (invalid) { setProjectFileError("Each file must be 15 MB or smaller and use an allowed document, image, text or ZIP format."); event.target.value = ""; return; }
                        setProjectFiles(selected);
                      }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold" />
                    </label>
                    {projectFileError && <p role="alert" className="text-xs text-red-700 sm:col-span-2">{projectFileError}</p>}
                    {(projectAttachments.length > 0 || projectFiles.length > 0) && <div className="space-y-1 text-xs text-slate-600 sm:col-span-2">
                      {projectAttachments.map((file) => <p key={file.path}>Saved: {file.name}</p>)}
                      {projectFiles.map((file) => <p key={file.name}>Ready to upload: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>)}
                    </div>}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
                  {isFillInActivity ? section.body.split(/((?:\\?_){3,})/g).map((part, partIndex) => {
                    if (!/(?:\\?_){3,}/.test(part)) return <span key={`${index}-text-${partIndex}`}>{part}</span>;
                    const answerIndex = renderedBlankIndex++;
                    return <input key={`${index}-blank-${answerIndex}`} aria-label={`Answer blank ${answerIndex + 1}`} value={fillInAnswers[answerIndex] ?? ""} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} onChange={(event) => {
                      const nextAnswers = [...fillInAnswers];
                      nextAnswers[answerIndex] = event.target.value;
                      setFillInAnswerDrafts((current) => ({ ...current, [fillInDraftKey]: nextAnswers }));
                      setResponseText(buildFillInResponse(nextAnswers));
                    }} className="mx-1 inline-block min-w-28 max-w-full rounded-md border border-slate-400 bg-white px-2 py-1 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" placeholder={`Blank ${answerIndex + 1}`} />
                  }) : section.body}
                </div>
              )}
            </article>
          )) : (
            <p className="text-sm text-slate-500">This content version is currently empty.</p>
          )}
        </div>
      </section>

      {currentContent.contentType === "writing" || isFillInActivity || isCodingActivity || isProjectActivity ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">{isCodingActivity ? "Submit your code" : isProjectActivity ? "Submit your project" : isFillInActivity ? "Submit your completed activity" : "Your response"}</h2>
          <p className="mt-1 text-sm text-slate-500">{isCodingActivity ? "Run your code in the isolated workspace above, then save a draft or submit it for teacher review." : isProjectActivity ? "Add your project link and explain what you built. Your teacher will review the submission." : isFillInActivity ? "Fill in each blank in the content above, then save your draft or submit the completed activity." : "Write your answer below. You can save a draft and return later."}</p>
          {!isFillInActivity && !isCodingActivity && !isProjectActivity && <textarea value={responseText} onChange={e => setResponseText(e.target.value)} disabled={responseQuery.data?.status === "submitted" || responseMutation.isPending} className="input mt-4 min-h-40 w-full resize-y" placeholder="Write your answer here..." />}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {responseQuery.data?.status === "submitted" ? <span className="text-sm font-medium text-emerald-700">Response submitted.</span> : <>
              <button type="button" disabled={(isCodingActivity ? !codeDraft.trim() || !codeRunSucceeded : isProjectActivity ? !projectSubmissionValid || Boolean(projectFileError) : isFillInActivity ? !fillInComplete : !responseText.trim()) || responseMutation.isPending} onClick={() => responseMutation.mutate("draft")} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Save draft</button>
              <button type="button" disabled={(isCodingActivity ? !codeDraft.trim() || !codeRunSucceeded : isFillInActivity ? !fillInComplete : !responseText.trim()) || responseMutation.isPending} onClick={() => responseMutation.mutate("submitted")} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{responseMutation.isPending ? "Submitting..." : "Submit response"}</button>
            </>}
          </div>
          {responseMutation.isError && <p className="mt-3 text-sm text-red-600">{mutationErrorMessage(responseMutation.error, "Could not save your response.")}</p>}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Complete this activity</h2><p className="mt-1 text-sm text-slate-500">Mark this required learning activity complete after you finish the lesson.</p></div><button type="button" disabled={completeMutation.isPending} onClick={() => completeMutation.mutate()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={17} />{completeMutation.isPending ? "Saving..." : "Mark as complete"}</button></div>
          {completeMutation.isSuccess && <p className="mt-3 text-sm font-medium text-emerald-700">Activity completed. Your assignment progress has been updated.</p>}
          {completeMutation.isError && <p className="mt-3 text-sm text-red-600">{completeMutation.error instanceof Error ? completeMutation.error.message : "Could not complete this activity."}</p>}
        </section>
      )}
      {responseQuery.data?.status === "submitted" && (
        <section aria-labelledby="student-result-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 id="student-result-heading" className="text-lg font-semibold text-slate-900">Your result</h2>
          {responseQuery.data.score !== null && responseQuery.data.maxScore !== null ? (
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">
                {responseQuery.data.score} / {responseQuery.data.maxScore}
                <span className="ml-2 text-base font-semibold text-slate-600">
                  ({responseQuery.data.maxScore > 0 ? ((responseQuery.data.score / responseQuery.data.maxScore) * 100).toFixed(2) : "0.00"}%)
                </span>
              </p>
              <p className="mt-1 text-sm text-emerald-700">Graded by your teacher</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Your response has been submitted and is awaiting teacher grading.</p>
          )}
          {responseQuery.data.teacherFeedback?.trim() && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teacher feedback</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{responseQuery.data.teacherFeedback}</p>
            </div>
          )}
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