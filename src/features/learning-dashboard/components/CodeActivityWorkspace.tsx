import { useEffect, useRef, useState } from "react";
import { Code2, Play, RotateCcw } from "lucide-react";

interface CodeActivityWorkspaceProps {
  instructions?: string;
  starterCode: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onRunResult: (result: { output: string; success: boolean }) => void;
}

const RUNNER_DOCUMENT = `<!doctype html>
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; connect-src 'none'; img-src data:">
</head>
<body>
<script>
(() => {
  const send = (payload) => parent.postMessage({ channel: "ep-code-runner", ...payload }, "*");
  window.addEventListener("message", (event) => {
    if (!event.data || event.data.channel !== "ep-code-run") return;
    const lines = [];
    const format = (value) => {
      if (typeof value === "string") return value;
      try { return JSON.stringify(value); } catch { return String(value); }
    };
    const originalLog = console.log;
    console.log = (...values) => lines.push(values.map(format).join(" "));
    try {
      const execute = new Function('"use strict";\\n' + String(event.data.code || ""));
      const result = execute();
      if (result !== undefined) lines.push(format(result));
      send({ success: true, output: lines.join("\\n") || "Code ran successfully. No output was produced." });
    } catch (error) {
      send({ success: false, output: error && error.stack ? error.stack : String(error) });
    } finally {
      console.log = originalLog;
    }
  });
  send({ ready: true });
})();
</script>
</body>
</html>`;

export default function CodeActivityWorkspace({
  instructions,
  starterCode,
  value,
  disabled,
  onChange,
  onRunResult,
}: CodeActivityWorkspaceProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [output, setOutput] = useState("");
  const [runState, setRunState] = useState<"idle" | "running" | "success" | "error" | "timeout">("idle");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.channel !== "ep-code-runner") return;
      if (event.data.ready) {
        setReady(true);
        return;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const result = { output: String(event.data.output ?? ""), success: event.data.success === true };
      setOutput(result.output);
      setRunState(result.success ? "success" : "error");
      onRunResult(result);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onRunResult]);

  const runCode = () => {
    if (disabled || !ready || !frameRef.current?.contentWindow) return;
    setRunState("running");
    setOutput("Running your code…");
    onRunResult({ output: "", success: false });
    frameRef.current.contentWindow.postMessage({ channel: "ep-code-run", code: value }, "*");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setRunState("timeout");
      setOutput("Execution stopped after 2 seconds. Check your code for an endless loop and try again.");
      onRunResult({ output: "Execution timed out.", success: false });
      setReady(false);
      if (frameRef.current) frameRef.current.srcdoc = RUNNER_DOCUMENT;
    }, 2000);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Code2 size={17} /> JavaScript coding workspace
        </div>
        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">Browser sandbox</span>
      </div>
      {instructions && <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-6 text-slate-700">{instructions}</p>}
      <div className="px-4 pb-4">
        <label htmlFor="student-code-editor" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Your code</label>
        <textarea
          id="student-code-editor"
          aria-label="JavaScript code editor"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-64 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-6 text-emerald-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-70"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={runCode} disabled={disabled || !ready || runState === "running"} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Play size={16} /> {runState === "running" ? "Running…" : "Run code"}
          </button>
          <button type="button" onClick={() => { onChange(starterCode); setOutput(""); setRunState("idle"); onRunResult({ output: "", success: false }); }} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">
            <RotateCcw size={15} /> Reset starter code
          </button>
          {!ready && <span className="text-xs text-slate-500">Preparing secure runner…</span>}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Program output</p>
        <pre aria-live="polite" className="mt-2 min-h-12 whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-100">{output || "Run your code to see the output here."}</pre>
        {runState === "success" && <p className="mt-2 text-xs font-medium text-emerald-700">Execution completed. You can now submit your work.</p>}
        {runState === "error" && <p className="mt-2 text-xs font-medium text-red-700">Your code has an error. Correct it and run again before submitting.</p>}
        {runState === "timeout" && <p className="mt-2 text-xs font-medium text-amber-700">The runner was restarted after the time limit.</p>}
      </div>
      <iframe ref={frameRef} title="Isolated JavaScript execution sandbox" sandbox="allow-scripts" srcDoc={RUNNER_DOCUMENT} onLoad={() => setReady(true)} className="hidden" />
    </section>
  );
}
