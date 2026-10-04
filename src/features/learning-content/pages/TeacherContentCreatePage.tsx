import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentType } from "@/features/learning-content";

const contentTypes: LearningContentType[] = [
  "lesson", "explanation", "reading", "listening", "speaking", "writing",
  "worksheet", "video", "audio", "interactive", "reference", "other",
];

export default function TeacherContentCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [contentType, setContentType] = useState<LearningContentType>("lesson");
  const [languageCode, setLanguageCode] = useState("en");
  const [body, setBody] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const organizationId = classes.data?.[0]?.membership.organizationId;

  const curricula = useQuery({
    queryKey: ["learning", "curricula"],
    queryFn: () => learningContentService.listCurricula(),
    enabled: Boolean(user?.id),
  });
  const gradeLevels = useQuery({
    queryKey: ["learning", "grade-levels", curriculumId],
    queryFn: () => learningContentService.listGradeLevels(curriculumId),
    enabled: Boolean(curriculumId),
  });
  const subjects = useQuery({
    queryKey: ["learning", "subjects"],
    queryFn: () => learningContentService.listSubjects(),
    enabled: Boolean(user?.id),
  });
  const skills = useQuery({
    queryKey: ["learning", "skills", subjectId],
    queryFn: () => learningContentService.listSkills(subjectId),
    enabled: Boolean(subjectId),
  });
  const topics = useQuery({
    queryKey: ["learning", "topics", skillId],
    queryFn: () => learningContentService.listTopics(skillId),
    enabled: Boolean(skillId),
  });
  const objectiveAlignments = useQuery({
    queryKey: ["learning", "objective-alignments", objectiveId, curriculumId, gradeLevelId],
    queryFn: () => learningContentService.listAlignments(objectiveId, curriculumId, gradeLevelId),
    enabled: Boolean(objectiveId && curriculumId && gradeLevelId),
  });
  const objectives = useQuery({
    queryKey: ["learning", "objectives", topicId],
    queryFn: () => learningContentService.listObjectives(topicId),
    enabled: Boolean(topicId),
  });
  const existingContent = useQuery({
    queryKey: ["learning", "teacher-content-library", organizationId],
    queryFn: () => learningContentService.listContent(organizationId),
    enabled: Boolean(organizationId),
  });

  const alignedObjectiveIds = useMemo(() => new Set((objectiveAlignments.data ?? []).map((item) => item.objectiveId)), [objectiveAlignments.data]);
  const selectedAlignment = objectiveAlignments.data?.[0];
  const selectedObjective = useMemo(
    () => objectives.data?.find((item) => item.id === objectiveId),
    [objectives.data, objectiveId],
  );

  function changeCurriculum(value: string) {
    setCurriculumId(value);
    setGradeLevelId("");
    setObjectiveId("");
  }
  function changeGradeLevel(value: string) {
    setGradeLevelId(value);
    setObjectiveId("");
  }
  function changeSubject(value: string) {
    setSubjectId(value);
    setSkillId("");
    setTopicId("");
    setObjectiveId("");
  }
  function changeSkill(value: string) {
    setSkillId(value);
    setTopicId("");
    setObjectiveId("");
  }
  function changeTopic(value: string) {
    setTopicId(value);
    setObjectiveId("");
  }
  function changeTitle(value: string) {
    const oldAutoCode = slugify(title);
    setTitle(value);
    if (!code || code === oldAutoCode) setCode(slugify(value));
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!user?.id || !organizationId) {
      setError("Your teacher organization could not be determined.");
      return;
    }
    if (!curriculumId || !gradeLevelId || !subjectId || !skillId || !topicId || !objectiveId || !title.trim() || !code.trim() || !body.trim()) {
      setError("Complete the subject, skill, topic, objective, title, code, and content body.");
      return;
    }

    if (!alignedObjectiveIds.has(objectiveId)) {
      setError("Select a learning objective aligned to the chosen curriculum and grade level.");
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    if ((existingContent.data ?? []).some((item) => item.code.toUpperCase() === normalizedCode)) {
      setError("That content code already exists in this organization. Use a different code.");
      return;
    }

    setSaving(true);
    try {
      const content = await learningContentService.createContent({
        organizationId,
        code: normalizedCode,
        title: title.trim(),
        contentType,
        languageCode,
        createdBy: user.id,
      });

      await learningContentService.createVersion({
        contentItemId: content.id,
        versionNo: 1,
        body: {
          sections: [{ type: "text", title: "Content", body: body.trim() }],
        },
        changeSummary: changeSummary.trim() || "Initial draft",
        createdBy: user.id,
      });

      await learningContentService.addObjective({
        contentItemId: content.id,
        objectiveId,
        sequenceNo: 1,
      });

      navigate("/teacher/content", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the content draft.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <Message text="Sign in to create learning content." />;
  if (classes.isPending || curricula.isPending || subjects.isPending) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError || curricula.isError || !organizationId) return <Message text="We could not determine your teacher organization." />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center gap-3">
        <Link to="/teacher/content" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Back">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><BookOpen size={18} />Teacher Content</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Create Content</h1>
          <p className="mt-1 text-sm text-slate-500">Build a reusable learning material and save it as a draft.</p>
        </div>
      </header>

      <form onSubmit={saveDraft} className="space-y-6">
        <Section number="1" title="Academic alignment" description="Choose the curriculum structure this material belongs to.">
          <Field label="Curriculum">
            <select value={curriculumId} onChange={(e) => changeCurriculum(e.target.value)} className="input w-full" required>
              <option value="">Select curriculum</option>
              {(curricula.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Grade level">
            <select value={gradeLevelId} onChange={(e) => changeGradeLevel(e.target.value)} className="input w-full" disabled={!curriculumId} required>
              <option value="">Select grade level</option>
              {(gradeLevels.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Subject">
            <select value={subjectId} onChange={(e) => changeSubject(e.target.value)} className="input w-full" required>
              <option value="">Select subject</option>
              {(subjects.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Skill">
            <select value={skillId} onChange={(e) => changeSkill(e.target.value)} className="input w-full" disabled={!subjectId} required>
              <option value="">Select skill</option>
              {(skills.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Topic">
            <select value={topicId} onChange={(e) => changeTopic(e.target.value)} className="input w-full" disabled={!skillId} required>
              <option value="">Select topic</option>
              {(topics.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Learning objective">
            <select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)} className="input w-full" disabled={!topicId || !gradeLevelId} required>
              <option value="">Select learning objective</option>
              {(objectives.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
            {selectedObjective?.description && <p className="mt-2 text-xs text-slate-500">{selectedObjective.description}</p>}
            {objectiveId && objectiveAlignments.isPending && <p className="mt-2 text-xs text-slate-500">Checking curriculum alignment...</p>}
            {objectiveId && !objectiveAlignments.isPending && !selectedAlignment && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">This objective is not aligned to the selected curriculum and grade level.</p>}
            {selectedAlignment && <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">Aligned to the selected curriculum and grade level{selectedAlignment.required ? " · Required" : ""}{selectedAlignment.notes ? ` · ${selectedAlignment.notes}` : ""}</p>}
          </Field>
        </Section>

        <Section number="2" title="Content details" description="Give the learning material its identity and format.">
          <Field label="Title">
            <input value={title} onChange={(e) => changeTitle(e.target.value)} className="input w-full" placeholder="e.g. Introducing Yourself" required />
          </Field>
          <Field label="Content code">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input w-full" placeholder="e.g. EN-M1-SELF-INTRO" required />
          </Field>
          <Field label="Content type">
            <select value={contentType} onChange={(e) => setContentType(e.target.value as LearningContentType)} className="input w-full">
              {contentTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}
            </select>
          </Field>
          <Field label="Language">
            <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="input w-full">
              <option value="en">English</option><option value="th">Thai</option><option value="sw">Swahili</option>
            </select>
          </Field>
        </Section>

        <Section number="3" title="Content body" description="Write the first draft of the learning material." full>
          <Field label="Learning content">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input min-h-64 w-full resize-y" placeholder="Write the lesson, explanation, reading passage, instructions, or other learning material here..." required />
          </Field>
          <Field label="Change summary (optional)">
            <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} className="input w-full" placeholder="Initial draft" />
          </Field>
        </Section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="flex justify-end gap-3">
          <Link to="/teacher/content" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
          <button type="submit" disabled={saving || existingContent.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            <Save size={17} />{saving ? "Saving draft..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ number, title, description, children, full = false }: { number: string; title: string; description: string; children: ReactNode; full?: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{number}</span><h2 className="text-lg font-semibold text-slate-900">{title}</h2></div>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <div className={`mt-5 grid gap-4 ${full ? "" : "md:grid-cols-2"}`}>{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}
function slugify(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
