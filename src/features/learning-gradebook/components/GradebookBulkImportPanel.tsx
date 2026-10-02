import { useState } from "react";
import { Download, Upload, CheckCircle2 } from "lucide-react";
import { learningGradebookService } from "../services/learning-gradebook.service";

type Student = { membership: { userId: string }; name: string; email: string };
type Category = { id: string; name: string };
type ImportRow = { studentUserId: string; title: string; categoryId: string | null; score: number; maxScore: number };

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = !quoted; }
    else if (ch === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) { if (ch === "\r" && text[i + 1] === "\n") i += 1; row.push(cell.trim()); cell = ""; if (row.some(Boolean)) rows.push(row); row = []; }
    else cell += ch;
  }
  if (cell.length || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
  return rows;
}
function csvCell(value: string) { return '"' + value.replaceAll('"', '""') + '"'; }

export function GradebookBulkImportPanel({ termId, classSubjectId, students, categories, onImported }: {
  termId: string; classSubjectId: string; students: Student[]; categories: Category[]; onImported: () => void;
}) {
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const downloadTemplate = () => {
    const rows: string[][] = [["student_id","student_name","email","assessment","category","score","max_score"]];
    for (const student of students) for (let i = 0; i < 7; i += 1) rows.push([student.membership.userId,student.name,student.email,"","","",""]);
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "EP-gradebook-score-template.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const readFile = async (file: File) => {
    setFileName(file.name); setMessage(""); setErrors([]); setPreview([]);
    const rows = parseCsv(await file.text());
    if (rows.length < 2) { setErrors(["The CSV has no score rows."]); return; }
    const header = rows[0].map((v) => v.toLowerCase());
    const required = ["student_id","assessment","score","max_score"];
    const missing = required.filter((key) => !header.includes(key));
    if (missing.length) { setErrors(["Missing columns: " + missing.join(", ")]); return; }
    const index = (key: string) => header.indexOf(key);
    const byId = new Map(students.map((student) => [student.membership.userId, student]));
    const byEmail = new Map(students.map((student) => [student.email.toLowerCase(), student]));
    const byCategory = new Map(categories.map((category) => [category.name.toLowerCase(), category]));
    const nextErrors: string[] = []; const nextRows: ImportRow[] = [];
    rows.slice(1).forEach((row, offset) => {
      const line = offset + 2; if (!row.some(Boolean)) return;
      const studentId = row[index("student_id")] ?? "";
      const email = index("email") >= 0 ? (row[index("email")] ?? "").toLowerCase() : "";
      const student = byId.get(studentId) ?? byEmail.get(email);
      const title = row[index("assessment")] ?? "";
      const categoryName = index("category") >= 0 ? row[index("category")] ?? "" : "";
      const score = Number(row[index("score")]); const maxScore = Number(row[index("max_score")]);
      if (!student) nextErrors.push("Line " + line + ": student was not matched.");
      if (!title.trim()) nextErrors.push("Line " + line + ": assessment is required.");
      if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore) nextErrors.push("Line " + line + ": score must be between 0 and max score.");
      const category = categoryName ? byCategory.get(categoryName.toLowerCase()) : undefined;
      if (categoryName && !category) nextErrors.push("Line " + line + ': category "' + categoryName + '" was not found.');
      if (student && title.trim() && Number.isFinite(score) && Number.isFinite(maxScore) && maxScore > 0 && score >= 0 && score <= maxScore && (!categoryName || category)) nextRows.push({ studentUserId: student.membership.userId,title:title.trim(),categoryId:category?.id ?? null,score,maxScore });
    });
    setErrors(nextErrors); setPreview(nextRows);
  };

  const importScores = async () => {
    if (!preview.length || errors.length) return;
    setImporting(true); setMessage("");
    try {
      const count = await learningGradebookService.bulkImportEntries({ termId, classSubjectId, rows: preview });
      setMessage(count + " score records imported successfully."); setPreview([]); onImported();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The score import failed."); }
    finally { setImporting(false); }
  };

  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2"><Upload size={18} /><h2 className="font-semibold text-slate-900">Bulk score upload</h2></div>
    <p className="mt-1 text-sm text-slate-500">Fill the template in Excel, save it as CSV, send it to the teacher, and she can upload it here. The system validates every student and score before saving.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"><Download size={16} />Download class template</button>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Upload size={16} />Choose CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const file=e.target.files?.[0]; if(file) void readFile(file); }} /></label>
    </div>
    {fileName && <p className="mt-3 text-xs text-slate-500">File: {fileName}</p>}
    {errors.length > 0 && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><p className="font-semibold">{errors.length} validation issue{errors.length===1?"":"s"}</p><ul className="mt-1 list-disc pl-5">{errors.slice(0,8).map((error) => <li key={error}>{error}</li>)}</ul>{errors.length>8 && <p className="mt-1">Showing the first 8 issues.</p>}</div>}
    {preview.length > 0 && errors.length === 0 && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-semibold text-emerald-900"><CheckCircle2 className="mr-1 inline" size={16} />Ready to import {preview.length} score records.</p><p className="mt-1 text-sm text-emerald-800">Scores are still only a preview until you confirm the import.</p><button type="button" onClick={() => void importScores()} disabled={importing} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{importing ? "Importing..." : "Confirm import"}</button></div>}
    {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
  </section>;
}
