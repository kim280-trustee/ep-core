import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { organizationService } from "@/core/organization";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningContentService } from "@/features/learning-content";
import { learningVocabularyService } from "../services/learning-vocabulary.service";
import type {
  LearningVocabularyEntry,
  VocabularyEntryStatus,
  VocabularyDifficulty,
  VocabularyProgressStatus,
} from "../types/learning-vocabulary.types";

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const primaryButton = "inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton = "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VocabularyForm = {
  word: string;
  definition: string;
  exampleSentence: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  topic: string;
  languageCode: string;
  translationLanguageCode: string;
  difficulty: VocabularyDifficulty;
  status: VocabularyEntryStatus;
};

const emptyForm: VocabularyForm = {
  word: "",
  definition: "",
  exampleSentence: "",
  translation: "",
  pronunciation: "",
  partOfSpeech: "",
  topic: "",
  languageCode: "en",
  translationLanguageCode: "",
  difficulty: "beginner",
  status: "draft",
};

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "The request failed. Check your access and the entered values, then try again.";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}</label>;
}

function statusLabel(status: VocabularyProgressStatus | undefined) {
  if (status === "known") return "Known";
  if (status === "learning") return "Needs practice";
  return "Not studied";
}

export function LearningVocabularyPage({ audience }: { audience: "teacher" | "student" }) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const isTeacher = audience === "teacher";
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [search, setSearch] = useState("");
  const [editingEntryId, setEditingEntryId] = useState("");
  const [form, setForm] = useState<VocabularyForm>(emptyForm);
  const [practiceEntryId, setPracticeEntryId] = useState("");
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [detailsEntryId, setDetailsEntryId] = useState("");
  const [editingTranslationId, setEditingTranslationId] = useState("");
  const [editingExampleId, setEditingExampleId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [translationForm, setTranslationForm] = useState({ languageCode: "th", translation: "", pronunciation: "", transliteration: "", audioUrl: "" });
  const [exampleForm, setExampleForm] = useState({ languageCode: "en", sentence: "", translationLanguageCode: "th", translatedSentence: "", sequenceNo: 1 });

  const membershipsQuery = useQuery({
    queryKey: ["learning-vocabulary", "memberships", user?.id, audience],
    queryFn: () => learningEnrollmentService.listUserClasses(user!.id),
    enabled: Boolean(user?.id) && !authLoading,
    staleTime: 30_000,
  });
  const relevantMemberships = (membershipsQuery.data ?? []).filter(
    (membership) => membership.status === "active" && membership.membershipType === audience,
  );
  const organizationIds = [...new Set(relevantMemberships.map((membership) => membership.organizationId))];

  const organizationsQuery = useQuery({
    queryKey: ["learning-vocabulary", "organizations", user?.id],
    queryFn: () => organizationService.getOrganizations(),
    enabled: Boolean(user?.id) && !authLoading,
    staleTime: 60_000,
  });
  const accessibleOrganizations = organizationsQuery.data ?? [];
  const organizationOptions = organizationIds.map((id) => ({
    id,
    name: accessibleOrganizations.find((organization) => organization.id === id)?.name ?? "School " + id.slice(0, 8),
  }));
  const organizationId = selectedOrganizationId && organizationIds.includes(selectedOrganizationId)
    ? selectedOrganizationId
    : organizationIds[0] ?? "";

  const entriesQuery = useQuery({
    queryKey: ["learning-vocabulary", "entries", organizationId, audience],
    queryFn: () => learningVocabularyService.listEntries(organizationId, isTeacher),
    enabled: Boolean(organizationId) && !membershipsQuery.isPending,
  });
  const progressQuery = useQuery({
    queryKey: ["learning-vocabulary", "progress", organizationId, user?.id],
    queryFn: () => learningVocabularyService.listProgress(organizationId, user!.id),
    enabled: !isTeacher && Boolean(organizationId && user?.id) && !membershipsQuery.isPending,
    // Refresh the due list as review deadlines pass, even if the student leaves the page open.
    refetchInterval: isTeacher ? false : 60_000,
  });
  const reviewClockQuery = useQuery({
    queryKey: ["learning-vocabulary", "review-clock"],
    queryFn: () => Date.now(),
    enabled: !isTeacher,
    refetchInterval: isTeacher ? false : 60_000,
    staleTime: 0,
  });

  const entries = entriesQuery.data ?? [];
  const progress = progressQuery.data ?? [];
  const detailsEntry = entries.find((entry) => entry.id === detailsEntryId);
  const translationsQuery = useQuery({
    queryKey: ["learning-vocabulary", "translations", organizationId, detailsEntryId],
    queryFn: () => learningVocabularyService.listTranslations(organizationId, detailsEntryId),
    enabled: Boolean(organizationId && detailsEntryId),
  });
  const examplesQuery = useQuery({
    queryKey: ["learning-vocabulary", "examples", organizationId, detailsEntryId],
    queryFn: () => learningVocabularyService.listExamples(organizationId, detailsEntryId),
    enabled: Boolean(organizationId && detailsEntryId),
  });
  const objectiveLinksQuery = useQuery({
    queryKey: ["learning-vocabulary", "objective-links", organizationId, detailsEntryId],
    queryFn: () => learningVocabularyService.listObjectiveLinks(organizationId, detailsEntryId),
    enabled: Boolean(organizationId && detailsEntryId),
  });
  const objectivesQuery = useQuery({
    queryKey: ["learning-vocabulary", "objectives", organizationId],
    queryFn: () => learningContentService.listObjectives(),
    enabled: Boolean(organizationId),
    staleTime: 60_000,
  });
  const progressByEntryId = new Map(progress.map((item) => [item.vocabularyEntryId, item]));
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredEntries = entries.filter((entry) =>
    [entry.word, entry.definition, entry.translation ?? "", entry.topic ?? "", entry.partOfSpeech ?? ""]
      .some((value) => value.toLocaleLowerCase().includes(normalizedSearch)),
  );
  const isDue = (entry: LearningVocabularyEntry) => {
    const saved = progressByEntryId.get(entry.id);
    return !saved || new Date(saved.nextReviewAt).getTime() <= (reviewClockQuery.data ?? 0);
  };
  const orderedFilteredEntries = isTeacher
    ? filteredEntries
    : [...filteredEntries].sort((left, right) => Number(isDue(right)) - Number(isDue(left)));
  const dueCount = isTeacher ? 0 : filteredEntries.filter(isDue).length;
  const practiceEntry = entries.find((entry) => entry.id === practiceEntryId);

  const playWordAudio = (word: string, languageCode: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechNotice("Audio playback is not supported by this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = languageCode || "en";
    window.speechSynthesis.speak(utterance);
    setSpeechNotice("Playing browser-generated pronunciation audio.");
  };

  const checkSpokenWord = (word: string, languageCode: string) => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechNotice("Speech recognition is not supported by this browser. You can still listen to the word.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = languageCode || "en";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let receivedResult = false;
    setSpeechNotice("Listening. Allow microphone access and say the word clearly.");
    recognition.onresult = (event) => {
      receivedResult = true;
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const normalize = (value: string) => value.normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      const matched = normalize(transcript) === normalize(word);
      setSpeechNotice(matched
        ? "Speech recognition matched the target word. This is a transcript match, not a phoneme-level pronunciation score."
        : "Speech recognition heard “" + transcript + "”. The word did not match exactly; listen again and retry. This is not a phoneme-level pronunciation score.");
    };
    recognition.onerror = () => setSpeechNotice("Speech recognition failed or microphone access was denied. Try listening and speaking again.");
    recognition.onend = () => {
      if (!receivedResult) setSpeechNotice("No clear word was recognized. Try again.");
    };
    try { recognition.start(); } catch { setSpeechNotice("Speech recognition could not start. Try again."); }
  };

  const saveMutation = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      setActionError("");
      setActionNotice("Vocabulary changes saved.");
      await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary", "entries", organizationId] });
      if (detailsEntryId) {
        await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary", "translations", organizationId, detailsEntryId] });
        await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary", "examples", organizationId, detailsEntryId] });
        await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary", "objective-links", organizationId, detailsEntryId] });
      }
    },
    onError: (error) => {
      setActionNotice("");
      setActionError(errorMessage(error));
    },
  });

  const progressMutation = useMutation({
    mutationFn: (input: {
      organizationId: string;
      vocabularyEntryId: string;
      status: VocabularyProgressStatus;
    }) => learningVocabularyService.recordReview({
      organizationId: input.organizationId,
      vocabularyEntryId: input.vocabularyEntryId,
      isCorrect: input.status === "known",
    }),
    onSuccess: async (result, input) => {
      setActionError("");
      setActionNotice(result.status === "known"
        ? "Word mastered. Spaced review will continue to reinforce it."
        : input.status === "known"
          ? "Correct answer recorded. Keep practicing to master this word."
          : "Review recorded. This word is scheduled for another practice soon.");
      await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary", "progress", input.organizationId, user?.id] });
      const currentIndex = orderedFilteredEntries.findIndex((entry) => entry.id === input.vocabularyEntryId);
      setPracticeEntryId(orderedFilteredEntries[currentIndex + 1]?.id ?? "");
      setAnswerRevealed(false);
    },
    onError: (error) => {
      setActionNotice("");
      setActionError(errorMessage(error));
    },
  });

  const submitEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !organizationId) return;
    if (!form.word.trim() || !form.definition.trim()) {
      setActionError("A word and definition are required.");
      return;
    }
    const languageCodePattern = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
    if (!languageCodePattern.test(form.languageCode.trim().toLowerCase())) {
      setActionError("Enter a valid language code, such as en or th.");
      return;
    }
    if (form.translationLanguageCode.trim() && !languageCodePattern.test(form.translationLanguageCode.trim().toLowerCase())) {
      setActionError("Enter a valid translation language code, such as th.");
      return;
    }
    const input = {
      tenantId: user.tenantId,
      organizationId,
      word: form.word.trim(),
      definition: form.definition.trim(),
      exampleSentence: form.exampleSentence,
      translation: form.translation,
      pronunciation: form.pronunciation,
      partOfSpeech: form.partOfSpeech,
      topic: form.topic,
      languageCode: form.languageCode.trim().toLowerCase(),
      translationLanguageCode: form.translationLanguageCode,
      difficulty: form.difficulty,
      status: form.status,
      createdBy: user.id,
      updatedBy: user.id,
    };
    try {
      if (editingEntryId) {
        await saveMutation.mutateAsync(() => learningVocabularyService.updateEntry(editingEntryId, {
          word: input.word,
          definition: input.definition,
          exampleSentence: input.exampleSentence,
          translation: input.translation,
          pronunciation: input.pronunciation,
          partOfSpeech: input.partOfSpeech,
          topic: input.topic,
          languageCode: input.languageCode,
          translationLanguageCode: input.translationLanguageCode,
          difficulty: input.difficulty,
          status: input.status,
          updatedBy: user.id,
        }));
      } else {
        await saveMutation.mutateAsync(() => learningVocabularyService.createEntry(input));
      }
      setEditingEntryId("");
      setForm(emptyForm);
    } catch {
      // The mutation displays the actionable error above the editor.
    }
  };

  const openDetails = (entryId: string) => {
    setDetailsEntryId(entryId);
    setEditingTranslationId("");
    setEditingExampleId("");
    setTranslationForm({ languageCode: "th", translation: "", pronunciation: "", transliteration: "", audioUrl: "" });
    setExampleForm({ languageCode: "en", sentence: "", translationLanguageCode: "th", translatedSentence: "", sequenceNo: 1 });
  };

  const submitTranslation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !organizationId || !detailsEntryId || !translationForm.translation.trim()) return;
    const languageCode = translationForm.languageCode.trim().toLowerCase();
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(languageCode)) {
      setActionError("Enter a valid translation language code, such as th or sw.");
      return;
    }
    try {
      if (editingTranslationId) {
        await saveMutation.mutateAsync(() => learningVocabularyService.updateTranslation(editingTranslationId, {
          translation: translationForm.translation,
          pronunciation: translationForm.pronunciation,
          transliteration: translationForm.transliteration,
          audioUrl: translationForm.audioUrl,
          updatedBy: user.id,
        }));
      } else {
        await saveMutation.mutateAsync(() => learningVocabularyService.createTranslation({
          tenantId: user.tenantId, organizationId, vocabularyEntryId: detailsEntryId,
          languageCode, translation: translationForm.translation,
          pronunciation: translationForm.pronunciation, transliteration: translationForm.transliteration,
          audioUrl: translationForm.audioUrl, createdBy: user.id, updatedBy: user.id,
        }));
      }
      setEditingTranslationId("");
      setTranslationForm({ languageCode: "th", translation: "", pronunciation: "", transliteration: "", audioUrl: "" });
    } catch {
      // The shared mutation state displays the actionable error.
    }
  };

  const submitExample = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !organizationId || !detailsEntryId || !exampleForm.sentence.trim()) return;
    const languageCode = exampleForm.languageCode.trim().toLowerCase();
    const translationLanguageCode = exampleForm.translationLanguageCode.trim().toLowerCase();
    const validCode = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
    if (!validCode.test(languageCode) || (translationLanguageCode && !validCode.test(translationLanguageCode))) {
      setActionError("Enter valid language codes for the example and its translation.");
      return;
    }
    try {
      if (editingExampleId) {
        await saveMutation.mutateAsync(() => learningVocabularyService.updateExample(editingExampleId, {
          languageCode, sentence: exampleForm.sentence,
          translationLanguageCode: translationLanguageCode || null,
          translatedSentence: exampleForm.translatedSentence,
          sequenceNo: exampleForm.sequenceNo, updatedBy: user.id,
        }));
      } else {
        await saveMutation.mutateAsync(() => learningVocabularyService.createExample({
          tenantId: user.tenantId, organizationId, vocabularyEntryId: detailsEntryId,
          languageCode, sentence: exampleForm.sentence,
          translationLanguageCode: translationLanguageCode || null,
          translatedSentence: exampleForm.translatedSentence,
          sequenceNo: exampleForm.sequenceNo, createdBy: user.id, updatedBy: user.id,
        }));
      }
      setEditingExampleId("");
      setExampleForm({ languageCode: "en", sentence: "", translationLanguageCode: "th", translatedSentence: "", sequenceNo: (examplesQuery.data?.length ?? 0) + 2 });
    } catch {
      // The shared mutation state displays the actionable error.
    }
  };

  const editTranslation = (translation: NonNullable<typeof translationsQuery.data>[number]) => {
    setEditingTranslationId(translation.id);
    setTranslationForm({
      languageCode: translation.languageCode, translation: translation.translation,
      pronunciation: translation.pronunciation ?? "", transliteration: translation.transliteration ?? "",
      audioUrl: translation.audioUrl ?? "",
    });
    setActionError("");
    setActionNotice("");
  };

  const editExample = (example: NonNullable<typeof examplesQuery.data>[number]) => {
    setEditingExampleId(example.id);
    setExampleForm({
      languageCode: example.languageCode, sentence: example.sentence,
      translationLanguageCode: example.translationLanguageCode ?? "",
      translatedSentence: example.translatedSentence ?? "", sequenceNo: example.sequenceNo,
    });
    setActionError("");
    setActionNotice("");
  };

  const editEntry = (entry: LearningVocabularyEntry) => {
    setEditingEntryId(entry.id);
    setForm({
      word: entry.word,
      definition: entry.definition,
      exampleSentence: entry.exampleSentence ?? "",
      translation: entry.translation ?? "",
      pronunciation: entry.pronunciation ?? "",
      partOfSpeech: entry.partOfSpeech ?? "",
      topic: entry.topic ?? "",
      languageCode: entry.languageCode,
      translationLanguageCode: entry.translationLanguageCode ?? "",
      difficulty: entry.difficulty,
      status: entry.status,
    });
    setActionError("");
    setActionNotice("");
  };

  const archiveEntry = (entry: LearningVocabularyEntry) => {
    if (!user) return;
    saveMutation.mutate(() => learningVocabularyService.updateEntry(entry.id, {
      status: "archived",
      updatedBy: user.id,
    }));
    if (editingEntryId === entry.id) {
      setEditingEntryId("");
      setForm(emptyForm);
    }
  };

  if (authLoading) {
    return <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Sign in to use vocabulary learning.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-slate-300">E&P Learning · Vocabulary</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{isTeacher ? "Vocabulary library" : "Vocabulary practice"}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {isTeacher
            ? "Create a reusable school vocabulary bank. Draft entries remain teacher-only until published."
            : "Study published words, reveal meanings, and record whether each word is known or needs more practice."}
        </p>
        {organizationOptions.length > 1 && (
          <label className="mt-5 block max-w-xl text-sm font-medium text-slate-200">School
            <select className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2.5 text-sm text-white" value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setPracticeEntryId(""); setAnswerRevealed(false); setEditingEntryId(""); setForm(emptyForm); }}>
              {organizationOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </label>
        )}
      </header>

      {actionError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex items-start justify-between gap-3"><p>{actionError}</p><button type="button" className="font-semibold" onClick={() => setActionError("")}>Dismiss</button></div></div>}
      {actionNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><div className="flex items-start justify-between gap-3"><p>{actionNotice}</p><button type="button" className="font-semibold" onClick={() => setActionNotice("")}>Dismiss</button></div></div>}

      {membershipsQuery.isPending && <div className="rounded-xl bg-white p-5 text-sm text-slate-500">Loading your class memberships…</div>}
      {membershipsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Your class memberships could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void membershipsQuery.refetch()}>Retry</button></div>}
      {!membershipsQuery.isPending && !membershipsQuery.isError && !organizationIds.length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {isTeacher ? "No active teacher class membership was found. Ask your school administrator to assign you to a class." : "No active student class membership was found. Ask your school administrator to assign you to a class."}
        </div>
      )}
      {organizationId && entriesQuery.isPending && <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />}
      {organizationId && entriesQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Vocabulary could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void entriesQuery.refetch()}>Retry</button></div>}
      {!isTeacher && organizationId && progressQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Your review schedule could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void progressQuery.refetch()}>Retry</button></div>}

      {organizationId && !entriesQuery.isPending && !entriesQuery.isError && (
        <>
          {isTeacher && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{editingEntryId ? "Edit vocabulary entry" : "Add vocabulary entry"}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Entries are shared with active classes in this school when published. Duplicate words in the same language are prevented by the database.</p>
                </div>
              </div>
              <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitEntry}>
                <Field label="Word / phrase"><input className={inputClass} required maxLength={120} value={form.word} onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))} placeholder="environment" /></Field>
                <Field label="Part of speech"><input className={inputClass} maxLength={40} value={form.partOfSpeech} onChange={(event) => setForm((current) => ({ ...current, partOfSpeech: event.target.value }))} placeholder="noun, verb, adjective…" /></Field>
                <Field label="Topic"><input className={inputClass} maxLength={120} value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} placeholder="Nature and the environment" /></Field>
                <Field label="Language code"><input className={inputClass} required maxLength={20} value={form.languageCode} onChange={(event) => setForm((current) => ({ ...current, languageCode: event.target.value }))} placeholder="en" /></Field>
                <Field label="Translation"><input className={inputClass} maxLength={500} value={form.translation} onChange={(event) => setForm((current) => ({ ...current, translation: event.target.value }))} placeholder="Optional translation" /></Field>
                <Field label="Translation language code"><input className={inputClass} maxLength={20} value={form.translationLanguageCode} onChange={(event) => setForm((current) => ({ ...current, translationLanguageCode: event.target.value }))} placeholder="th (optional)" /></Field>
                <Field label="Pronunciation / phonetics"><input className={inputClass} maxLength={200} value={form.pronunciation} onChange={(event) => setForm((current) => ({ ...current, pronunciation: event.target.value }))} placeholder="Optional pronunciation guide" /></Field>
                <Field label="Difficulty"><select className={inputClass} value={form.difficulty} onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value as VocabularyDifficulty }))}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></Field>
                <Field label="Publication status"><select className={inputClass} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as VocabularyEntryStatus }))}><option value="draft">Draft (teachers only)</option><option value="published">Published (students can study)</option><option value="archived">Archived</option></select></Field>
                <div className="md:col-span-2 xl:col-span-3"><Field label="Definition"><textarea className={inputClass} required rows={3} maxLength={3000} value={form.definition} onChange={(event) => setForm((current) => ({ ...current, definition: event.target.value }))} placeholder="Explain the word clearly for learners." /></Field></div>
                <div className="md:col-span-2 xl:col-span-3"><Field label="Example sentence"><textarea className={inputClass} rows={2} maxLength={2000} value={form.exampleSentence} onChange={(event) => setForm((current) => ({ ...current, exampleSentence: event.target.value }))} placeholder="Use the word in a natural sentence." /></Field></div>
                <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-3">
                  <button type="submit" className={primaryButton} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : editingEntryId ? "Save entry" : "Create entry"}</button>
                  {editingEntryId && <button type="button" className={secondaryButton} onClick={() => { setEditingEntryId(""); setForm(emptyForm); }}>Cancel edit</button>}
                </div>
              </form>
            </section>
          )}

          { !isTeacher && practiceEntry && (
            <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8" aria-labelledby="practice-card-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Flashcard practice</p>
                  <h2 id="practice-card-title" className="mt-2 text-2xl font-bold text-slate-950">{practiceEntry.word}</h2>
                  {practiceEntry.partOfSpeech && <p className="mt-1 text-sm text-slate-600">{practiceEntry.partOfSpeech}</p>}
                  {practiceEntry.pronunciation && <p className="mt-2 text-sm text-slate-600">Pronunciation: {practiceEntry.pronunciation}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className={secondaryButton} onClick={() => playWordAudio(practiceEntry.word, practiceEntry.languageCode)}>Listen to pronunciation</button>
                    <button type="button" className={secondaryButton} onClick={() => checkSpokenWord(practiceEntry.word, practiceEntry.languageCode)}>Check spoken word</button>
                  </div>
                  {speechNotice && <p role="status" className="mt-2 max-w-xl text-xs leading-5 text-slate-600">{speechNotice}</p>}
                </div>
                <button type="button" className={secondaryButton} onClick={() => { setPracticeEntryId(""); setAnswerRevealed(false); setSpeechNotice(""); }}>Close practice</button>
              </div>
              {!answerRevealed ? (
                <button type="button" className={primaryButton + " mt-5"} onClick={() => setAnswerRevealed(true)}>Reveal meaning</button>
              ) : (
                <>
                  <div className="mt-5 rounded-xl border border-indigo-100 bg-white p-4">
                    <h3 className="font-semibold text-slate-900">Definition</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{practiceEntry.definition}</p>
                    {practiceEntry.translation && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Translation:</span> {practiceEntry.translation}</p>}
                    {practiceEntry.exampleSentence && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Example:</span> {practiceEntry.exampleSentence}</p>}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">How well did you know this word?</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" className={primaryButton} disabled={progressMutation.isPending} onClick={() => progressMutation.mutate({ organizationId, vocabularyEntryId: practiceEntry.id, status: "known" })}>I knew it</button>
                    <button type="button" className={secondaryButton} disabled={progressMutation.isPending} onClick={() => progressMutation.mutate({ organizationId, vocabularyEntryId: practiceEntry.id, status: "learning" })}>Need more practice</button>
                  </div>
                </>
              )}
            </section>
          )}

          {detailsEntry && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="vocabulary-details-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reusable dictionary details</p>
                  <h2 id="vocabulary-details-heading" className="mt-1 text-xl font-bold text-slate-950">{detailsEntry.word}</h2>
                  <p className="mt-1 text-sm text-slate-500">Translations and example sentences are stored separately so one word can support several languages.</p>
                </div>
                <button type="button" className={secondaryButton} onClick={() => { setDetailsEntryId(""); setEditingTranslationId(""); setEditingExampleId(""); }}>Close details</button>
              </div>
              <div className="mt-5 grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Translations</h3>
                    {translationsQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading translations…</p>}
                    {translationsQuery.isError && <p role="alert" className="mt-2 text-sm text-red-700">Translations could not be loaded. <button type="button" className="underline" onClick={() => void translationsQuery.refetch()}>Retry</button></p>}
                    {translationsQuery.data?.map((translation) => (
                      <article key={translation.id} className="mt-2 rounded-xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{translation.translation} <span className="text-xs font-normal text-slate-500">({translation.languageCode})</span></p>
                            {translation.transliteration && <p className="mt-1 text-sm text-slate-600">Transliteration: {translation.transliteration}</p>}
                            {translation.pronunciation && <p className="mt-1 text-sm text-slate-600">Pronunciation: {translation.pronunciation}</p>}
                            {translation.audioUrl && <audio className="mt-2 max-w-full" controls preload="none" src={translation.audioUrl}>Audio playback is not supported.</audio>}
                          </div>
                          {isTeacher && <button type="button" className={secondaryButton} onClick={() => editTranslation(translation)}>Edit</button>}
                        </div>
                      </article>
                    ))}
                    {!translationsQuery.isPending && !translationsQuery.isError && !translationsQuery.data?.length && <p className="mt-2 text-sm text-slate-500">No additional translations have been added.</p>}
                  </div>
                  {isTeacher && (
                    <form className="rounded-xl bg-slate-50 p-4" onSubmit={(event) => void submitTranslation(event)}>
                      <h4 className="font-semibold text-slate-900">{editingTranslationId ? "Edit translation" : "Add translation"}</h4>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Language code"><input className={inputClass} required disabled={Boolean(editingTranslationId)} maxLength={20} value={translationForm.languageCode} onChange={(event) => setTranslationForm((current) => ({ ...current, languageCode: event.target.value }))} placeholder="th, sw, fr…" /></Field>
                        <Field label="Translation"><input className={inputClass} required maxLength={1000} value={translationForm.translation} onChange={(event) => setTranslationForm((current) => ({ ...current, translation: event.target.value }))} /></Field>
                        <Field label="Pronunciation"><input className={inputClass} maxLength={200} value={translationForm.pronunciation} onChange={(event) => setTranslationForm((current) => ({ ...current, pronunciation: event.target.value }))} /></Field>
                        <Field label="Transliteration"><input className={inputClass} maxLength={200} value={translationForm.transliteration} onChange={(event) => setTranslationForm((current) => ({ ...current, transliteration: event.target.value }))} /></Field>
                        <div className="sm:col-span-2"><Field label="Audio URL"><input className={inputClass} type="url" maxLength={2000} value={translationForm.audioUrl} onChange={(event) => setTranslationForm((current) => ({ ...current, audioUrl: event.target.value }))} placeholder="https://…" /></Field></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="submit" className={primaryButton} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : editingTranslationId ? "Save translation" : "Add translation"}</button>
                        {editingTranslationId && <button type="button" className={secondaryButton} onClick={() => { setEditingTranslationId(""); setTranslationForm({ languageCode: "th", translation: "", pronunciation: "", transliteration: "", audioUrl: "" }); }}>Cancel</button>}
                      </div>
                    </form>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Example sentences</h3>
                    {examplesQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading examples…</p>}
                    {examplesQuery.isError && <p role="alert" className="mt-2 text-sm text-red-700">Examples could not be loaded. <button type="button" className="underline" onClick={() => void examplesQuery.refetch()}>Retry</button></p>}
                    {examplesQuery.data?.map((example) => (
                      <article key={example.id} className="mt-2 rounded-xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm leading-6 text-slate-800">{example.sentence}</p>
                            {example.translatedSentence && <p className="mt-1 text-sm text-slate-600">{example.translatedSentence} <span className="text-xs">({example.translationLanguageCode})</span></p>}
                          </div>
                          {isTeacher && <div className="flex gap-2"><button type="button" className={secondaryButton} onClick={() => editExample(example)}>Edit</button><button type="button" className={secondaryButton} disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(() => learningVocabularyService.deleteExample(example.id))}>Delete</button></div>}
                        </div>
                      </article>
                    ))}
                    {!examplesQuery.isPending && !examplesQuery.isError && !examplesQuery.data?.length && <p className="mt-2 text-sm text-slate-500">No example sentences have been added.</p>}
                  </div>
                  {isTeacher && (
                    <form className="rounded-xl bg-slate-50 p-4" onSubmit={(event) => void submitExample(event)}>
                      <h4 className="font-semibold text-slate-900">{editingExampleId ? "Edit example" : "Add example sentence"}</h4>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Sentence language"><input className={inputClass} required maxLength={20} value={exampleForm.languageCode} onChange={(event) => setExampleForm((current) => ({ ...current, languageCode: event.target.value }))} /></Field>
                        <Field label="Sequence"><input className={inputClass} type="number" min={1} required value={exampleForm.sequenceNo} onChange={(event) => setExampleForm((current) => ({ ...current, sequenceNo: Number(event.target.value) }))} /></Field>
                        <div className="sm:col-span-2"><Field label="Example sentence"><textarea className={inputClass} required rows={2} maxLength={2000} value={exampleForm.sentence} onChange={(event) => setExampleForm((current) => ({ ...current, sentence: event.target.value }))} /></Field></div>
                        <Field label="Translation language"><input className={inputClass} maxLength={20} value={exampleForm.translationLanguageCode} onChange={(event) => setExampleForm((current) => ({ ...current, translationLanguageCode: event.target.value }))} /></Field>
                        <Field label="Translated example"><input className={inputClass} maxLength={2000} value={exampleForm.translatedSentence} onChange={(event) => setExampleForm((current) => ({ ...current, translatedSentence: event.target.value }))} /></Field>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="submit" className={primaryButton} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : editingExampleId ? "Save example" : "Add example"}</button>
                        {editingExampleId && <button type="button" className={secondaryButton} onClick={() => { setEditingExampleId(""); setExampleForm({ languageCode: "en", sentence: "", translationLanguageCode: "th", translatedSentence: "", sequenceNo: (examplesQuery.data?.length ?? 0) + 1 }); }}>Cancel</button>}
                      </div>
                    </form>
                  )}
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-semibold text-slate-900">Curriculum alignment</h3>
                <p className="mt-1 text-sm text-slate-500">Link this vocabulary item to one or more learning objectives so it can be reused by lessons and curriculum-based recommendations.</p>
                {objectiveLinksQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading objective links…</p>}
                {objectiveLinksQuery.isError && <p role="alert" className="mt-2 text-sm text-red-700">Objective links could not be loaded. <button type="button" className="underline" onClick={() => void objectiveLinksQuery.refetch()}>Retry</button></p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {objectiveLinksQuery.data?.map((link) => {
                    const objective = objectivesQuery.data?.find((item) => item.id === link.objectiveId);
                    return <span key={link.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{objective ? `${objective.code} · ${objective.name}` : `Objective ${link.objectiveId.slice(0, 8)}`}{isTeacher && <button type="button" className="font-bold" aria-label="Remove objective link" onClick={() => saveMutation.mutate(() => learningVocabularyService.unlinkObjective(link.id))}>×</button>}</span>;
                  })}
                  {!objectiveLinksQuery.isPending && !objectiveLinksQuery.isError && !objectiveLinksQuery.data?.length && <p className="text-sm text-slate-500">No curriculum objectives linked yet.</p>}
                </div>
                {isTeacher && (
                  <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => {
                    event.preventDefault();
                    if (!user || !organizationId || !detailsEntryId || !objectiveId) return;
                    saveMutation.mutate(() => learningVocabularyService.linkObjective({
                      tenantId: user.tenantId, organizationId, vocabularyEntryId: detailsEntryId,
                      objectiveId, createdBy: user.id,
                    }));
                    setObjectiveId("");
                  }}>
                    <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">Learning objective
                      <select className={inputClass} value={objectiveId} required onChange={(event) => setObjectiveId(event.target.value)}>
                        <option value="">Choose an objective…</option>
                        {(objectivesQuery.data ?? []).map((objective) => <option key={objective.id} value={objective.id}>{objective.code} · {objective.name}</option>)}
                      </select>
                    </label>
                    <button type="submit" className={primaryButton} disabled={saveMutation.isPending || objectivesQuery.isPending}>{saveMutation.isPending ? "Saving…" : "Link objective"}</button>
                  </form>
                )}
                {isTeacher && objectivesQuery.isError && <p role="alert" className="mt-2 text-sm text-red-700">Learning objectives could not be loaded. <button type="button" className="underline" onClick={() => void objectivesQuery.refetch()}>Retry</button></p>}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{isTeacher ? "School vocabulary bank" : "Words to study"}</h2>
                <p className="mt-1 text-sm text-slate-500">{filteredEntries.length} of {entries.length} entries{!isTeacher ? ` · ${dueCount} due for review` : ""}</p>
              </div>
              <label className="block w-full sm:max-w-sm"><span className="text-sm font-medium text-slate-700">Search words, definitions, translations, or topics</span><input className={inputClass} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vocabulary…" /></label>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orderedFilteredEntries.map((entry) => {
                const progressItem = progressByEntryId.get(entry.id);
                return (
                  <article key={entry.id} className="flex flex-col rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-semibold text-slate-950">{entry.word}</h3>
                        {entry.partOfSpeech && <p className="mt-0.5 text-xs text-slate-500">{entry.partOfSpeech}</p>}
                      </div>
                      <span className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " + (entry.status === "published" ? "bg-emerald-50 text-emerald-800" : entry.status === "draft" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600")}>{entry.status}</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{entry.definition}</p>
                    {entry.translation && <p className="mt-2 text-sm text-slate-600"><span className="font-medium">Translation:</span> {entry.translation}</p>}
                    {entry.topic && <p className="mt-2 text-xs text-slate-500">Topic: {entry.topic}</p>}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                      {isTeacher ? (
                        <div className="flex flex-wrap gap-2"><button type="button" className={secondaryButton} onClick={() => openDetails(entry.id)}>Translations & examples</button><button type="button" className={secondaryButton} onClick={() => editEntry(entry)}>Edit</button>{entry.status !== "archived" && <button type="button" className={secondaryButton} disabled={saveMutation.isPending} onClick={() => archiveEntry(entry)}>Archive</button>}</div>
                      ) : (
                        <>
                          <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (progressItem?.status === "known" ? "bg-emerald-50 text-emerald-800" : progressItem?.status === "learning" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600")}>{statusLabel(progressItem?.status)}</span>
                          <div className="flex flex-wrap gap-2"><button type="button" className={primaryButton} onClick={() => { setPracticeEntryId(entry.id); setAnswerRevealed(false); }}>Practice</button><button type="button" className={secondaryButton} onClick={() => openDetails(entry.id)}>Translations & examples</button></div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
              {!filteredEntries.length && <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-3">{entries.length ? "No vocabulary matches your search." : isTeacher ? "No entries yet. Add a word above, then publish it for students." : "No published vocabulary is available for your classes yet. Ask your teacher to publish a vocabulary list."}</div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default LearningVocabularyPage;
