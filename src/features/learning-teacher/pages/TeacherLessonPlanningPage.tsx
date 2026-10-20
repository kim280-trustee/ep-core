import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";

const inputClass = "mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const labelClass = "block text-sm font-medium text-slate-700";

function slugify(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4"><h2 className="text-lg font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>{children}</section>;
}

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <label className={labelClass}>{label}{required ? " *" : ""}{children}</label>;
}

export default function TeacherLessonPlanningPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [durationMinutes, setDurationMinutes] = useState("50");
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [resources, setResources] = useState("");
  const [openingActivity, setOpeningActivity] = useState("");
  const [instruction, setInstruction] = useState("");
  const [guidedPractice, setGuidedPractice] = useState("");
  const [independentPractice, setIndependentPractice] = useState("");
  const [assessment, setAssessment] = useState("");
  const [differentiation, setDifferentiation] = useState("");
  const [extension, setExtension] = useState("");
  const [formError, setFormError] = useState("");

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const classes = classesQuery.data ?? [];
  const validClassGroupId = classes.some((item) => item.classGroup.id === classGroupId) ? classGroupId : "";
  const selectedClass = classes.find((item) => item.classGroup.id === validClassGroupId);
  const organizationId = selectedClass?.membership.organizationId ?? "";

  const curriculaQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "curricula"],
    queryFn: () => learningContentService.listCurricula(),
    enabled: Boolean(user?.id),
  });
  const curricula = curriculaQuery.data ?? [];
  const validCurriculumId = curricula.some((item) => item.id === curriculumId) ? curriculumId : "";
  const gradeLevelsQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "grade-levels", validCurriculumId],
    queryFn: () => learningContentService.listGradeLevels(validCurriculumId),
    enabled: Boolean(validCurriculumId),
  });
  const gradeLevels = gradeLevelsQuery.data ?? [];
  const validGradeLevelId = gradeLevels.some((item) => item.id === gradeLevelId) ? gradeLevelId : "";
  const subjectsQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "subjects", validCurriculumId],
    queryFn: () => learningContentService.listSubjects(validCurriculumId),
    enabled: Boolean(validCurriculumId),
  });
  const subjects = subjectsQuery.data ?? [];
  const validSubjectId = subjects.some((item) => item.id === subjectId) ? subjectId : "";
  const skillsQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "skills", validSubjectId],
    queryFn: () => learningContentService.listSkills(validSubjectId),
    enabled: Boolean(validSubjectId),
  });
  const skills = skillsQuery.data ?? [];
  const validSkillId = skills.some((item) => item.id === skillId) ? skillId : "";
  const topicsQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "topics", validSkillId],
    queryFn: () => learningContentService.listTopics(validSkillId),
    enabled: Boolean(validSkillId),
  });
  const topics = topicsQuery.data ?? [];
  const validTopicId = topics.some((item) => item.id === topicId) ? topicId : "";
  const alignmentsQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "alignments", validCurriculumId, validGradeLevelId],
    queryFn: () => learningContentService.listAlignments(undefined, validCurriculumId, validGradeLevelId),
    enabled: Boolean(validCurriculumId && validGradeLevelId),
  });
  const alignedObjectiveIds = useMemo(() => new Set((alignmentsQuery.data ?? []).map((item) => item.objectiveId)), [alignmentsQuery.data]);
  const objectivesQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "objectives", validTopicId],
    queryFn: () => learningContentService.listObjectives(validTopicId),
    enabled: Boolean(validTopicId),
  });
  const objectives = (objectivesQuery.data ?? []).filter((item) => alignedObjectiveIds.has(item.id));
  const selectedObjective = objectives.find((item) => item.id === objectiveId);
  const existingContentQuery = useQuery({
    queryKey: ["learning", "lesson-planning", "existing-content", organizationId],
    queryFn: () => learningContentService.listContent(organizationId),
    enabled: Boolean(organizationId),
  });

  const createPlan = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId || !selectedClass) throw new Error("Select one of your active teaching classes first.");
      if (!validCurriculumId || !validGradeLevelId || !validSubjectId || !validSkillId || !validTopicId || !selectedObjective) {
        throw new Error("Select a curriculum, grade, subject, skill, topic and aligned learning objective.");
      }
      if (!title.trim() || !code.trim()) throw new Error("Lesson title and content code are required.");
      if (!openingActivity.trim() || !instruction.trim() || !guidedPractice.trim() || !assessment.trim()) {
        throw new Error("Complete the opening activity, teaching steps, guided practice and assessment before saving.");
      }
      const duration = Number(durationMinutes);
      if (!Number.isInteger(duration) || duration < 5 || duration > 300) throw new Error("Lesson duration must be a whole number from 5 to 300 minutes.");
      const normalizedCode = code.trim().toUpperCase();
      if ((existingContentQuery.data ?? []).some((item) => item.code.trim().toUpperCase() === normalizedCode)) {
        throw new Error("That content code already exists in this school. Use a different code.");
      }

      const sections = [
        { type: "text", title: "Lesson overview", body: ["Class context: " + selectedClass.classGroup.name + " (" + selectedClass.classGroup.code + ")", "Curriculum: " + (curricula.find((item) => item.id === validCurriculumId)?.name ?? ""), "Grade level: " + (gradeLevels.find((item) => item.id === validGradeLevelId)?.name ?? ""), "Subject: " + (subjects.find((item) => item.id === validSubjectId)?.name ?? ""), "Duration: " + duration + " minutes", "Language: " + languageCode.toUpperCase(), priorKnowledge.trim() ? "Prior knowledge: " + priorKnowledge.trim() : ""].filter(Boolean).join("\n") },
        { type: "text", title: "Learning objective", body: selectedObjective.code + " — " + selectedObjective.name + (selectedObjective.description ? "\n" + selectedObjective.description : "") },
        { type: "text", title: "Resources and preparation", body: resources.trim() || "No additional resources specified." },
        { type: "text", title: "Opening activity", body: openingActivity.trim() },
        { type: "text", title: "Teaching and modelling", body: instruction.trim() },
        { type: "text", title: "Guided practice", body: guidedPractice.trim() },
        { type: "text", title: "Independent practice", body: independentPractice.trim() || "Not specified." },
        { type: "text", title: "Assessment and exit ticket", body: assessment.trim() },
        { type: "text", title: "Differentiation and support", body: differentiation.trim() || "Not specified." },
        { type: "text", title: "Extension or homework", body: extension.trim() || "Not specified." },
      ];
      let contentId: string | null = null;
      try {
        const item = await learningContentService.createContent({
          organizationId,
          code: normalizedCode,
          title: title.trim(),
          contentType: "lesson",
          languageCode,
          createdBy: user.id,
        });
        contentId = item.id;
        await learningContentService.createVersion({
          contentItemId: item.id,
          versionNo: 1,
          body: { sections },
          changeSummary: "Initial structured lesson plan",
          createdBy: user.id,
        });
        await learningContentService.addObjective({ contentItemId: item.id, objectiveId: selectedObjective.id, sequenceNo: 1 });
        return item;
      } catch (error) {
        if (contentId) {
          try { await learningContentService.deleteContent(contentId); } catch { /* Keep the original save error. */ }
        }
        throw error;
      }
    },
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "content"] });
      navigate("/teacher/content/" + item.id);
    },
    onError: (error: Error) => setFormError(error.message),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (createPlan.isPending) return;
    createPlan.mutate();
  }

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to create a lesson plan.</div>;
  if (classesQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Your teaching classes could not be loaded. Refresh and try again.</div>;
  if (!classes.length) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><h1 className="font-semibold">No active teaching class</h1><p className="mt-1 text-sm">You need an active teaching-class membership before creating a school-owned lesson plan.</p></div>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={16}/>Back to teacher workspace</Link>
      <div className="mt-4 flex items-start gap-3"><div className="rounded-xl bg-white/10 p-3"><BookOpen size={22}/></div><div><p className="text-sm font-medium text-slate-300">Teaching support · Academic planning</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Lesson planning</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Create a structured, curriculum-aligned lesson plan and save it in your school’s existing content library. Plans remain drafts until reviewed and published through the existing content workflow.</p></div></div>
    </header>

    <form onSubmit={submit} className="space-y-5">
      <Section title="1. Teaching context" description="Select the school class and align the plan to an existing curriculum outcome.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teacher class" required><select value={validClassGroupId} onChange={(event) => setClassGroupId(event.target.value)} className={inputClass} required><option value="">Select class</option>{classes.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name} ({item.classGroup.code})</option>)}</select></Field>
          <Field label="Curriculum" required><select value={validCurriculumId} onChange={(event) => { setCurriculumId(event.target.value); setGradeLevelId(""); setSubjectId(""); setSkillId(""); setTopicId(""); setObjectiveId(""); }} className={inputClass} required><option value="">Select curriculum</option>{curricula.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
          <Field label="Grade level" required><select value={validGradeLevelId} onChange={(event) => { setGradeLevelId(event.target.value); setObjectiveId(""); }} className={inputClass} disabled={!validCurriculumId} required><option value="">Select grade</option>{gradeLevels.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
          <Field label="Subject" required><select value={validSubjectId} onChange={(event) => { setSubjectId(event.target.value); setSkillId(""); setTopicId(""); setObjectiveId(""); }} className={inputClass} disabled={!validCurriculumId} required><option value="">Select subject</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
          <Field label="Skill" required><select value={validSkillId} onChange={(event) => { setSkillId(event.target.value); setTopicId(""); setObjectiveId(""); }} className={inputClass} disabled={!validSubjectId} required><option value="">Select skill</option>{skills.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
          <Field label="Topic" required><select value={validTopicId} onChange={(event) => { setTopicId(event.target.value); setObjectiveId(""); }} className={inputClass} disabled={!validSkillId} required><option value="">Select topic</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></Field>
          <Field label="Learning objective" required><select value={selectedObjective?.id ?? ""} onChange={(event) => setObjectiveId(event.target.value)} className={inputClass} disabled={!validTopicId || alignmentsQuery.isPending} required><option value="">Select objective aligned to this grade</option>{objectives.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select>{alignmentsQuery.isError && <span className="mt-1 block text-xs text-red-700">Curriculum alignment could not be loaded. Retry before saving.</span>}{validTopicId && !alignmentsQuery.isPending && !alignmentsQuery.isError && !objectives.length && <span className="mt-1 block text-xs text-amber-700">No objective for this topic is aligned to the selected curriculum and grade.</span>}</Field>
        </div>
      </Section>

      <Section title="2. Lesson details" description="Identify the plan and choose the learner-facing language.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lesson title" required><input value={title} onChange={(event) => { setTitle(event.target.value); if (!code) setCode(slugify(event.target.value)); }} className={inputClass} maxLength={160} required placeholder="Present Simple: Daily Routines"/></Field>
          <Field label="Unique content code" required><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className={inputClass} maxLength={80} required placeholder="ENG-M1-DAILY-ROUTINES-PLAN"/></Field>
          <Field label="Lesson duration (minutes)" required><input type="number" min={5} max={300} step={1} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} className={inputClass} required/></Field>
          <Field label="Plan language" required><select value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} className={inputClass}><option value="en">English</option><option value="th">Thai</option><option value="sw">Swahili</option></select></Field>
          <div className="sm:col-span-2"><Field label="Prior knowledge / prerequisite"><textarea value={priorKnowledge} onChange={(event) => setPriorKnowledge(event.target.value)} className={inputClass} rows={2} placeholder="What should learners already know?"/></Field></div>
          <div className="sm:col-span-2"><Field label="Resources and preparation"><textarea value={resources} onChange={(event) => setResources(event.target.value)} className={inputClass} rows={2} placeholder="Board, cards, textbook pages, audio, or other resources"/></Field></div>
        </div>
      </Section>

      <Section title="3. Teaching sequence" description="Plan the lesson in a clear progression from introduction to guided and independent work.">
        <div className="space-y-4">
          <Field label="Opening / warm-up activity" required><textarea value={openingActivity} onChange={(event) => setOpeningActivity(event.target.value)} className={inputClass} rows={3} required placeholder="How will you activate prior knowledge and engage learners?"/></Field>
          <Field label="Teacher explanation and modelling" required><textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} className={inputClass} rows={4} required placeholder="Key explanation, examples, modelling and checks for understanding"/></Field>
          <Field label="Guided practice" required><textarea value={guidedPractice} onChange={(event) => setGuidedPractice(event.target.value)} className={inputClass} rows={3} required placeholder="Activities completed with teacher support"/></Field>
          <Field label="Independent practice"><textarea value={independentPractice} onChange={(event) => setIndependentPractice(event.target.value)} className={inputClass} rows={3} placeholder="What will learners practise independently?"/></Field>
          <Field label="Assessment / exit ticket" required><textarea value={assessment} onChange={(event) => setAssessment(event.target.value)} className={inputClass} rows={3} required placeholder="How will you check achievement of the objective?"/></Field>
          <Field label="Differentiation and learner support"><textarea value={differentiation} onChange={(event) => setDifferentiation(event.target.value)} className={inputClass} rows={2} placeholder="Scaffolds, language support, accessibility and extension for learners who need it"/></Field>
          <Field label="Extension / homework"><textarea value={extension} onChange={(event) => setExtension(event.target.value)} className={inputClass} rows={2} placeholder="Optional follow-up activity"/></Field>
        </div>
      </Section>

      {formError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{formError}</div>}
      {createPlan.isPending && <p role="status" className="text-sm text-slate-600">Saving the lesson plan to the school content library…</p>}
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/teacher/content" className="text-sm font-semibold text-slate-600 underline">Open content library</Link><button type="submit" disabled={createPlan.isPending || !organizationId || curriculaQuery.isError || existingContentQuery.isError} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17}/>{createPlan.isPending ? "Saving plan…" : "Save lesson plan draft"}</button></div>
      {existingContentQuery.isError && <p className="text-sm text-red-700">The school content library could not be checked for duplicate codes. Retry before saving.</p>}
      <p className="text-xs text-slate-500">A saved plan is a draft content item, not an assignment. To deliver it to learners, review and publish it in the content workflow, then attach it to an assignment.</p>
    </form>
  </div>;
}
