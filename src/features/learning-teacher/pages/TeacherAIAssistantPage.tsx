import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertCircle, Copy, Sparkles } from "lucide-react";
import { useAuth } from "@/core/auth";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningTeacherService } from "../services/learning-teacher.service";
import { learningContentService } from "@/features/learning-content";

type MaterialFormat = "lesson" | "worksheet" | "quiz" | "lesson_plan";
type DraftRequest = {
  organizationId: string;
  subject: string;
  gradeLevel: string;
  topic: string;
  objective: string;
  format: MaterialFormat;
  language: "English" | "Thai" | "English and Thai";
  difficulty: "beginner" | "developing" | "on_level" | "stretch";
  country: string;
  educationSystem: string;
  curriculumReference: string;
  durationMinutes: number;
  priorKnowledge: string;
  availableMaterials: string;
  teacherNeeds: string;
};
type DraftResponse = {
  draft: string;
  model?: string;
  requiresTeacherReview: true;
  usage?: {
    usedLast24Hours: number;
    dailyLimit: number;
    remainingRequests: number;
    resetAt: string | null;
  };
};

export default function TeacherAIAssistantPage() {
  const { user } = useAuth();
  const [classGroupId, setClassGroupId] = useState("");
  const [subject, setSubject] = useState("English");
  const [gradeLevel, setGradeLevel] = useState("M1");
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [format, setFormat] = useState<MaterialFormat>("lesson");
  const [language, setLanguage] = useState<DraftRequest["language"]>("English");
  const [difficulty, setDifficulty] = useState<DraftRequest["difficulty"]>("developing");
  const [country, setCountry] = useState("Thailand");
  const [educationSystem, setEducationSystem] = useState("MEP");
  const [curriculumReference, setCurriculumReference] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("50");
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [availableMaterials, setAvailableMaterials] = useState("");
  const [teacherNeeds, setTeacherNeeds] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const classes = useQuery({
    queryKey: ["learning", "teacher-ai-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const selectedClass = classes.data?.find((item) => item.classGroup.id === classGroupId)
    ?? classes.data?.[0];
  const organizationId = selectedClass?.classGroup.organizationId?.trim()
    || selectedClass?.membership.organizationId?.trim()
    || "";

  const generate = useMutation({
    mutationFn: async (request: DraftRequest): Promise<DraftResponse> => {
      const { data, error } = await supabase.functions.invoke("generate-teaching-material", {
        body: request,
      });
      if (error) {
        const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        const details = await context?.json?.().catch(() => null);
        throw new Error(details?.error || error.message || "The draft could not be generated.");
      }
      if (!data || typeof data.draft !== "string" || !data.draft.trim()) {
        throw new Error("The AI service returned an invalid draft. Please try again.");
      }
      return data as DraftResponse;
    },
  });

  const saveDraft = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId || !generate.data?.draft?.trim()) {
        throw new Error("Generate a draft and select an active teacher class before saving.");
      }
      const suffix = Date.now().toString(36).toUpperCase();
      const code = `AI-${format.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${suffix}`;
      const title = `${topic.trim()} — ${format === "lesson_plan" ? "Lesson plan" : format[0].toUpperCase() + format.slice(1)}`;
      const content = await learningContentService.createContent({
        organizationId,
        code,
        title: title.slice(0, 180),
        contentType: format === "worksheet" ? "worksheet" : format === "quiz" ? "other" : "lesson",
        languageCode: language === "Thai" ? "th" : "en",
        createdBy: user.id,
      });
      await learningContentService.createVersion({
        contentItemId: content.id,
        versionNo: 1,
        changeSummary: "AI-generated draft saved for teacher editing and review; not published.",
        createdBy: user.id,
        body: {
          sections: [{ type: "text", title: "AI-generated draft", body: generate.data.draft }],
          aiDraftContext: { country, educationSystem, curriculumReference, subject, gradeLevel, topic, objective, format, language, difficulty, durationMinutes: Number(durationMinutes), priorKnowledge, availableMaterials, teacherNeeds },
          requiresTeacherReview: true,
        },
      });
      return { id: content.id, title: content.title };
    },
  });

  const handleGenerate = () => {
    setCopyMessage("");
    if (!organizationId) {
      generate.reset();
      return;
    }
    if (!subject.trim() || !gradeLevel.trim() || !topic.trim() || !objective.trim()) return;
    generate.mutate({
      organizationId,
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      topic: topic.trim(),
      objective: objective.trim(),
      format,
      language,
      difficulty,
      country: country.trim(),
      educationSystem: educationSystem.trim(),
      curriculumReference: curriculumReference.trim(),
      durationMinutes: Number(durationMinutes),
      priorKnowledge: priorKnowledge.trim(),
      availableMaterials: availableMaterials.trim(),
      teacherNeeds: teacherNeeds.trim(),
    });
  };

  const copyDraft = async () => {
    if (!generate.data?.draft) return;
    try {
      await navigator.clipboard.writeText(generate.data.draft);
      setCopyMessage("Draft copied.");
    } catch {
      setCopyMessage("Copy was blocked by this browser. Select the draft text and copy it manually.");
    }
  };

  const fieldClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const labelClass = "block text-sm font-medium text-slate-700";

  if (!user) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold">AI Teacher Assistant</h1><p className="mt-2 text-sm text-slate-600">Sign in with an active teacher account to continue.</p></section>;
  }

  if (classes.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" aria-label="Loading teacher classes" />;
  }

  if (classes.isError || !classes.data?.length) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-xl font-bold text-slate-900">AI Teacher Assistant</h1><p className="mt-2 text-sm text-amber-900">An active teacher class could not be loaded. Check your teacher assignment and refresh this page.</p></section>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="flex items-center gap-2 text-indigo-700"><Sparkles size={20} /><span className="text-sm font-semibold">Teacher tools</span></div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">AI Teacher Assistant</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create a first draft of a lesson, worksheet, quiz or lesson plan from your learning objective. Generated material is not saved or published automatically.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Draft requirements</h2>
          <div className="mt-4 space-y-4">
            <label className={labelClass}>Teacher class
              <select className={fieldClass} value={selectedClass?.classGroup.id ?? ""} onChange={(event) => setClassGroupId(event.target.value)}>
                {classes.data.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}
              </select>
            </label>
            <label className={labelClass}>Subject
              <input className={fieldClass} value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} required placeholder="English" />
            </label>
            <label className={labelClass}>Grade / level
              <input className={fieldClass} value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} maxLength={80} required placeholder="M1 / Grade 7" />
            </label>
            <label className={labelClass}>Topic
              <input className={fieldClass} value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={200} required placeholder="Self introduction" />
            </label>
            <label className={labelClass}>Learning objective
              <textarea className={fieldClass} value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={500} rows={3} required placeholder="By the end of the lesson, learners can introduce themselves using simple sentences." />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>Material type
                <select className={fieldClass} value={format} onChange={(event) => setFormat(event.target.value as MaterialFormat)}>
                  <option value="lesson">Lesson</option><option value="worksheet">Worksheet</option><option value="quiz">Quiz</option><option value="lesson_plan">Lesson plan</option>
                </select>
              </label>
              <label className={labelClass}>Language
                <select className={fieldClass} value={language} onChange={(event) => setLanguage(event.target.value as DraftRequest["language"])}>
                  <option value="English">English</option><option value="Thai">Thai</option><option value="English and Thai">English and Thai</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>Country
                <input className={fieldClass} value={country} onChange={(event) => setCountry(event.target.value)} maxLength={100} placeholder="Thailand" />
              </label>
              <label className={labelClass}>Education system
                <input className={fieldClass} value={educationSystem} onChange={(event) => setEducationSystem(event.target.value)} maxLength={120} placeholder="MEP / national curriculum" />
              </label>
            </div>
            <label className={labelClass}>Curriculum reference (optional)
              <input className={fieldClass} value={curriculumReference} onChange={(event) => setCurriculumReference(event.target.value)} maxLength={500} placeholder="Official curriculum, standard, or learning outcome reference" />
            </label>
            <label className={labelClass}>Lesson duration (minutes)
              <input className={fieldClass} type="number" min={5} max={240} step={1} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
            </label>
            <label className={labelClass}>Learners' prior knowledge (optional)
              <textarea className={fieldClass} value={priorKnowledge} onChange={(event) => setPriorKnowledge(event.target.value)} maxLength={1000} rows={2} placeholder="What learners already know; do not include student names or personal data." />
            </label>
            <label className={labelClass}>Available materials (optional)
              <textarea className={fieldClass} value={availableMaterials} onChange={(event) => setAvailableMaterials(event.target.value)} maxLength={1000} rows={2} placeholder="Textbook pages, board, projector, printed cards..." />
            </label>
            <label className={labelClass}>Teacher support needed (optional)
              <textarea className={fieldClass} value={teacherNeeds} onChange={(event) => setTeacherNeeds(event.target.value)} maxLength={1000} rows={2} placeholder="Thai explanations, simple teacher scripts, common errors, differentiation..." />
            </label>
            <label className={labelClass}>Difficulty
              <select className={fieldClass} value={difficulty} onChange={(event) => setDifficulty(event.target.value as DraftRequest["difficulty"])}>
                <option value="beginner">Beginner / needs support</option><option value="developing">Developing</option><option value="on_level">On level</option><option value="stretch">Stretch / extension</option>
              </select>
            </label>
            {generate.isError && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{generate.error.message}</span></div>}
            <button type="button" onClick={handleGenerate} disabled={generate.isPending || !organizationId || !subject.trim() || !gradeLevel.trim() || !topic.trim() || !objective.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Sparkles size={16} />{generate.isPending ? "Generating draft…" : "Generate draft"}
            </button>
            <p className="text-xs leading-5 text-slate-500">Do not enter student names, contact details, grades or other personal information. Check facts, answer keys and curriculum fit before using the material.</p>
          </div>
        </section>

        <section className="min-h-[28rem] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-base font-bold text-slate-900">Generated draft</h2><p className="mt-1 text-xs text-slate-500">Editable text · not saved to the content library</p></div>
            {generate.data && <button type="button" onClick={() => void copyDraft()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Copy size={14} />Copy draft</button>}
          </div>
          {copyMessage && <p role="status" className="mt-3 text-xs text-slate-600">{copyMessage}</p>}
          {generate.isPending ? <div className="mt-6 space-y-3" aria-label="Generating draft"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-4 w-full animate-pulse rounded bg-slate-200" /><div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" /><div className="h-32 animate-pulse rounded-xl bg-slate-100" /></div>
            : generate.data ? <><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Teacher review required.</strong> This draft has not been validated against an official curriculum and has not been published.</div>{generate.data.usage && <p className="mt-3 text-xs text-slate-500" role="status">AI usage: {generate.data.usage.remainingRequests} of {generate.data.usage.dailyLimit} draft requests remaining in the rolling 24-hour window.</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => saveDraft.mutate()} disabled={saveDraft.isPending || !organizationId} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{saveDraft.isPending ? "Saving draft…" : "Save to content library"}</button><a href="/teacher/content" className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open content library</a></div>{saveDraft.isError && <p role="alert" className="mt-3 text-sm text-red-700">{saveDraft.error.message}</p>}{saveDraft.data && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Saved “{saveDraft.data.title}” as a draft. Open the content library to continue editing and review it before publication.</p>}<pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-800">{generate.data.draft}</pre></>
            : <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Sparkles size={24} className="mx-auto text-slate-400" /><p className="mt-3 text-sm font-semibold text-slate-700">Your draft will appear here</p><p className="mt-1 text-sm text-slate-500">Enter the objective and select Generate draft.</p></div>}
        </section>
      </div>
    </div>
  );
}
