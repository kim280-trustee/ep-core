import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, MessageCircle, Mic, MicOff, Sparkles, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { organizationService } from "@/core/organization";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningContentService } from "@/features/learning-content";

type CoachResponse = {
  response: string;
  contentTitle: string;
  requiresTeacherGuidance: true;
  usage?: {
    usedLast24Hours: number;
    dailyLimit: number;
    remainingRequests: number;
    resetAt: string | null;
  };
};


type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
};
type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResult;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};
type SpeechRecognitionErrorEvent = { error: string };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function errorFrom(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "The AI coach could not respond. Check your access and try again.";
}

export default function LearningAICoachPage() {
  const { user } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedContentItemId, setSelectedContentItemId] = useState("");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<"English" | "Thai" | "English and Thai">("English");
  const [speechLanguage, setSpeechLanguage] = useState<"en-US" | "th-TH">("en-US");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [speechOutputLanguage, setSpeechOutputLanguage] = useState<"en-US" | "th-TH">("en-US");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const browserWindow = typeof window === "undefined"
    ? null
    : window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
  const speechRecognitionConstructor = browserWindow?.SpeechRecognition
    ?? browserWindow?.webkitSpeechRecognition
    ?? null;

  useEffect(() => () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const startListening = () => {
    if (!speechRecognitionConstructor) {
      setSpeechError("Speech recognition is not supported in this browser. Type your question instead.");
      return;
    }
    if (generate.isPending) return;

    const recognition = new speechRecognitionConstructor();
    recognition.lang = speechLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) transcript += result[0]?.transcript ?? "";
      }
      const spokenText = transcript.trim();
      if (spokenText) {
        setQuestion((current) => [current.trim(), spokenText].filter(Boolean).join(" "));
        setSpeechError("");
      }
    };
    recognition.onerror = (event) => {
      setSpeechError(event.error === "not-allowed"
        ? "Microphone access was denied. Allow access in your browser settings or type your question."
        : "Speech recognition stopped. You can type or edit your question instead.");
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setSpeechError("");
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechError("The microphone could not start. Check browser permissions and try again.");
    }
  };

  const stopListening = () => recognitionRef.current?.stop();

  const readResponseAloud = () => {
    const response = generate.data?.response;
    if (!response || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Read-aloud is not supported on this device. You can read the response on screen.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = speechOutputLanguage;
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechError("Audio playback stopped. The written response is still available.");
    };
    setSpeechError("");
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const membershipsQuery = useQuery({
    queryKey: ["learning-ai-coach", "memberships", user?.id],
    queryFn: () => learningEnrollmentService.listUserClasses(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const organizationsQuery = useQuery({
    queryKey: ["learning-ai-coach", "organizations", user?.id],
    queryFn: () => organizationService.getOrganizations(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const studentMemberships = (membershipsQuery.data ?? []).filter(
    (membership) => membership.status === "active" && membership.membershipType === "student",
  );
  const organizationIds = [...new Set(studentMemberships.map((membership) => membership.organizationId))];
  const organizationId = selectedOrganizationId && organizationIds.includes(selectedOrganizationId)
    ? selectedOrganizationId
    : organizationIds[0] ?? "";

  const contentQuery = useQuery({
    queryKey: ["learning-ai-coach", "published-content", user?.id, organizationId],
    queryFn: () => learningContentService.listContent(organizationId),
    enabled: Boolean(user?.id && organizationId),
  });

  const publishedItems = (contentQuery.data ?? []).filter((item) => item.status === "published");
  const contentItemId = publishedItems.some((item) => item.id === selectedContentItemId)
    ? selectedContentItemId
    : publishedItems[0]?.id ?? "";

  const generate = useMutation({
    mutationFn: async (): Promise<CoachResponse> => {
      if (!organizationId || !contentItemId) {
        throw new Error("Choose a published learning item first.");
      }
      const { data, error } = await supabase.functions.invoke("learning-student-ai-coach", {
        body: {
          organizationId,
          contentItemId,
          question: question.trim(),
          language,
        },
      });
      if (error) {
        const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        const details = await context?.json?.().catch(() => null);
        throw new Error(details?.error || error.message || "The AI coach could not respond.");
      }
      if (!data || typeof data.response !== "string" || !data.response.trim()) {
        throw new Error("The AI coach returned an invalid response. Please try again.");
      }
      return data as CoachResponse;
    },
  });

  const fieldClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const labelClass = "block text-sm font-medium text-slate-700";

  if (!user) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold">AI Learning Coach</h1><p className="mt-2 text-sm text-slate-600">Sign in with your student account to continue.</p></section>;
  }

  if (membershipsQuery.isPending || organizationsQuery.isPending) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-200" aria-label="Loading your learning materials" />;
  }

  if (membershipsQuery.isError || organizationsQuery.isError) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" role="alert"><h1 className="font-semibold text-slate-900">Your learning access could not be loaded.</h1><p className="mt-1 text-sm text-amber-900">Your saved learning data has not been changed. Refresh and try again.</p></section>;
  }

  if (!studentMemberships.length) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold">AI Learning Coach</h1><p className="mt-2 text-sm text-slate-600">An active student enrollment is required. Ask your school administrator if you believe this is a mistake.</p></section>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 p-6 text-white sm:p-8">
        <div className="flex items-center gap-2 text-indigo-200"><Sparkles size={19} /><span className="text-sm font-semibold">Guided practice</span></div>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">AI Learning Coach</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Ask about a published lesson. The coach uses that material to explain a concept, give you a hint, and help you practise step by step.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={(event) => { event.preventDefault(); generate.mutate(); }}
        >
          <h2 className="font-bold text-slate-900">What are you learning?</h2>
          <label className={labelClass}>School
            <select className={fieldClass} value={organizationId} onChange={(event) => { setSelectedOrganizationId(event.target.value); setSelectedContentItemId(""); generate.reset(); }} required>
              {organizationIds.map((id) => {
                const organization = (organizationsQuery.data ?? []).find((item) => item.id === id);
                return <option key={id} value={id}>{organization?.name ?? "School " + id.slice(0, 8)}</option>;
              })}
            </select>
          </label>
          <label className={labelClass}>Published lesson
            <select className={fieldClass} value={contentItemId} onChange={(event) => { setSelectedContentItemId(event.target.value); generate.reset(); }} disabled={contentQuery.isPending || publishedItems.length === 0} required>
              {publishedItems.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          {contentQuery.isPending && <p className="text-xs text-slate-500">Loading published lessons…</p>}
          {contentQuery.isError && <p className="text-sm text-red-700" role="alert">Published lessons could not be loaded. Retry after checking your school access.</p>}
          {contentQuery.isSuccess && publishedItems.length === 0 && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No published learning items are available in this school yet. Ask your teacher to publish a lesson first.</p>}
          <label className={labelClass}>Response language
            <select className={fieldClass} value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
              <option value="English">English</option><option value="Thai">Thai</option><option value="English and Thai">English and Thai</option>
            </select>
          </label>
          <label className={labelClass}>Your question
            <textarea className={fieldClass} rows={5} value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} required placeholder="Type a question, or use the microphone to speak." />
          </label>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className={labelClass + " min-w-36 flex-1"}>Spoken language
                <select className={fieldClass} value={speechLanguage} onChange={(event) => setSpeechLanguage(event.target.value as typeof speechLanguage)} disabled={isListening}>
                  <option value="en-US">English</option>
                  <option value="th-TH">Thai</option>
                </select>
              </label>
              <button type="button" onClick={isListening ? stopListening : startListening} disabled={generate.isPending || (!speechRecognitionConstructor && !isListening)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                {isListening ? "Stop microphone" : "Speak your question"}
              </button>
            </div>
            {isListening && <p className="text-sm font-medium text-indigo-800" role="status">Listening… speak clearly, then stop when you are finished.</p>}
            {speechError && <p className="text-sm text-red-700" role="alert">{speechError}</p>}
            {!speechRecognitionConstructor && <p className="text-xs text-slate-600">This browser does not provide speech recognition. You can still type your question.</p>}
            <p className="text-xs leading-5 text-slate-600">Review and edit the transcript before submitting. Speech recognition is handled by your browser or device and may use the browser provider's service; E&P sends the text you submit to the coach, not a stored audio recording.</p>
          </div>
          <p className="text-xs leading-5 text-slate-500">Do not enter your full name, address, phone number, password, or other personal information.</p>
          <button type="submit" disabled={generate.isPending || !contentItemId || !question.trim() || contentQuery.isError} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
            <MessageCircle size={17} />{generate.isPending ? "Preparing your practice…" : "Help me understand"}
          </button>
          <p className="text-xs text-slate-500">The coach is a practice aid, not a replacement for your teacher. E&P Learning does not save your prompt or response as chat history; minimal usage-limit metadata is retained.</p>
        </form>

        <section className="min-h-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><BookOpen size={20} /></span><div><h2 className="font-bold text-slate-900">Your learning help</h2><p className="text-xs text-slate-500">Based on the selected published lesson</p></div></div>
          {generate.isError && <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p className="text-sm">{errorFrom(generate.error)}</p></div>}
          {!generate.data && !generate.isError && <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-center"><Sparkles className="mx-auto text-slate-400" size={26} /><p className="mt-3 font-semibold text-slate-800">Ready when you are</p><p className="mt-1 text-sm text-slate-500">Choose a published lesson and ask one clear question to get a hint and guided practice.</p><Link to="/learning/assignments" className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900">Review your assignments</Link></div>}
          {generate.data && <div className="mt-5 space-y-4"><div className="rounded-xl bg-indigo-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Lesson</p><p className="mt-1 font-semibold text-slate-900">{generate.data.contentTitle}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-end gap-3">
                <label className={labelClass + " min-w-36 flex-1"}>Read-aloud language
                  <select className={fieldClass} value={speechOutputLanguage} onChange={(event) => setSpeechOutputLanguage(event.target.value as typeof speechOutputLanguage)} disabled={isSpeaking}>
                    <option value="en-US">English voice</option>
                    <option value="th-TH">Thai voice</option>
                  </select>
                </label>
                <button type="button" onClick={isSpeaking ? stopSpeaking : readResponseAloud} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50">
                  {isSpeaking ? <MicOff size={17} /> : <Volume2 size={17} />}
                  {isSpeaking ? "Stop audio" : "Read response aloud"}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">Audio uses your browser or device's built-in speech synthesis. Available voices depend on the device and selected language.</p>
            </div><div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{generate.data.response}</div>{generate.data.usage && <p className="border-t pt-3 text-xs text-slate-500">{generate.data.usage.remainingRequests} of {generate.data.usage.dailyLimit} AI coach requests remaining in the rolling 24-hour window.</p>}<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Check your understanding with your teacher. If the lesson does not answer your question, ask your teacher for help.</p></div>}
        </section>
      </section>
    </div>
  );
}
