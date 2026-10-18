import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";
import type {
  MarketplaceSafetyCategory,
  MarketplaceSafetyReport,
  MarketplaceSafetyStatus,
} from "../types/learning-marketplace.types";

const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900";
const label = "block text-sm font-medium text-slate-700";
const categories: { value: MarketplaceSafetyCategory; label: string }[] = [
  { value: "safeguarding_concern", label: "Child or learner safeguarding concern" },
  { value: "inappropriate_contact", label: "Inappropriate contact or communication" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "harassment_or_discrimination", label: "Harassment or discrimination" },
  { value: "fraud_or_misrepresentation", label: "Fraud or misleading information" },
  { value: "other", label: "Other safety concern" },
];
const statusLabels: Record<MarketplaceSafetyStatus, string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export default function MarketplaceSafetyPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookingId, setBookingId] = useState("");
  const [category, setCategory] = useState<MarketplaceSafetyCategory>("safeguarding_concern");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const bookings = useQuery({
    queryKey: ["marketplace", "requests", user?.id],
    queryFn: () => learningMarketplaceService.listBookingRequests(),
    enabled: Boolean(user?.id),
  });
  const reports = useQuery({
    queryKey: ["marketplace", "safety-reports", user?.id],
    queryFn: () => learningMarketplaceService.listSafetyReports(),
    enabled: Boolean(user?.id),
  });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["marketplace", "safety-reports"] }),
      queryClient.invalidateQueries({ queryKey: ["marketplace", "requests"] }),
    ]);
  };
  const createReport = useMutation({
    mutationFn: () => learningMarketplaceService.createSafetyReport({
      bookingRequestId: bookingId,
      category,
      description: description.trim(),
    }),
    onSuccess: async () => {
      setDescription("");
      setBookingId("");
      setNotice({ kind: "success", text: "Your safety report was submitted to the school review process." });
      await refresh();
    },
    onError: (error: Error) => setNotice({ kind: "error", text: error.message || "The safety report could not be submitted." }),
  });
  const reviewReport = useMutation({
    mutationFn: (input: { reportId: string; status: Exclude<MarketplaceSafetyStatus, "open">; reviewNote: string }) =>
      learningMarketplaceService.reviewSafetyReport(input),
    onSuccess: refresh,
  });

  if (!user) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-amber-100 p-3 text-amber-800"><ShieldCheck size={22} /></span>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Safety and safeguarding</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Report a concern connected to an extra-class booking. Reports are visible to the reporter and authorized school owners/managers, not to the reported teacher.
            If someone is in immediate danger, contact local emergency services or a trusted safeguarding lead.
          </p>
        </div>
      </div>

      <form className="grid gap-4 rounded-xl border border-amber-100 bg-white p-4 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        setNotice(null);
        createReport.mutate();
      }}>
        <label className={label}>Related booking
          <select className={field} value={bookingId} onChange={(event) => setBookingId(event.target.value)} required>
            <option value="">Select a booking request</option>
            {(bookings.data ?? []).map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.offering_title} · {booking.status} · {new Date(booking.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>Concern category
          <select className={field} value={category} onChange={(event) => setCategory(event.target.value as MarketplaceSafetyCategory)}>
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className={label + " md:col-span-2"}>Describe what happened
          <textarea className={field} value={description} onChange={(event) => setDescription(event.target.value)} minLength={20} maxLength={3000} rows={4} required placeholder="Describe the concern factually. Avoid including unnecessary student personal information." />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
          <p className="text-xs text-slate-500">20–3000 characters. Only people involved in the booking can submit a report for it.</p>
          <button type="submit" disabled={!bookingId || description.trim().length < 20 || description.trim().length > 3000 || createReport.isPending || bookings.isPending}
            className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {createReport.isPending ? "Submitting…" : "Submit safety report"}
          </button>
        </div>
      </form>

      {notice && <p role={notice.kind === "error" ? "alert" : "status"} className={"rounded-xl border p-3 text-sm " + (notice.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900")}>{notice.text}</p>}
      {reports.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Safety reports could not be loaded. Check whether the safeguarding migration has been applied.</p>}
      {reviewReport.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">The report review could not be saved.</p>}

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-slate-950">Your reports and school review queue</h3>
          <p className="mt-1 text-xs text-slate-500">Authorized school owners/managers see reports for their school. Reporters can track their own report status.</p>
        </div>
        {reports.isPending ? <div className="h-20 animate-pulse rounded-xl bg-white" /> : (reports.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed border-amber-200 bg-white p-4 text-sm text-slate-500">No safety reports are available to this account.</p>
        ) : (reports.data ?? []).map((report) => (
          <SafetyReportCard key={report.id} report={report} onReview={(input) => reviewReport.mutate(input)} reviewPending={reviewReport.isPending} />
        ))}
      </div>
    </section>
  );
}

function SafetyReportCard({
  report,
  onReview,
  reviewPending,
}: {
  report: MarketplaceSafetyReport;
  onReview: (input: { reportId: string; status: Exclude<MarketplaceSafetyStatus, "open">; reviewNote: string }) => void;
  reviewPending: boolean;
}) {
  const [status, setStatus] = useState<Exclude<MarketplaceSafetyStatus, "open">>(
    report.status === "open" ? "under_review" : report.status,
  );
  const [reviewNote, setReviewNote] = useState("");
  const categoryLabel = categories.find((item) => item.value === report.category)?.label ?? report.category;

  return (
    <article className="rounded-xl border border-amber-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{report.organization_name} · {report.offering_title}</p>
          <h4 className="mt-1 font-semibold text-slate-950">{categoryLabel}</h4>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (report.status === "open" ? "bg-amber-100 text-amber-900" : report.status === "resolved" ? "bg-emerald-100 text-emerald-900" : report.status === "dismissed" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-900")}>
          {statusLabels[report.status]}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.description}</p>
      <p className="mt-2 text-xs text-slate-500">Submitted {new Date(report.created_at).toLocaleString()}</p>
      {report.review_note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">School review: {report.review_note}</p>}
      {report.can_review && report.status !== "resolved" && report.status !== "dismissed" && (
        <form className="mt-4 space-y-3 border-t pt-4" onSubmit={(event) => {
          event.preventDefault();
          onReview({ reportId: report.id, status, reviewNote: reviewNote.trim() });
        }}>
          <label className={label}>Review status
            <select className={field} value={status} onChange={(event) => setStatus(event.target.value as Exclude<MarketplaceSafetyStatus, "open">)}>
              <option value="under_review">Under review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </label>
          <label className={label}>Internal review note
            <textarea className={field} rows={2} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={2000} placeholder="Document action taken. This note is not shown to the reporter." />
          </label>
          <button type="submit" disabled={reviewPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            <AlertTriangle size={16} /> {reviewPending ? "Saving…" : "Save review"}
          </button>
        </form>
      )}
    </article>
  );
}
