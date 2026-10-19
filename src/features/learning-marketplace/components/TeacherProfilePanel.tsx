import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";
import type { TeacherProfile, TeacherProfileForReview } from "../types/learning-marketplace.types";

const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm";
const label = "block text-sm font-medium text-slate-700";

export default function TeacherProfilePanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizations = useQuery({
    queryKey: ["marketplace", "orgs", user?.id],
    queryFn: () => learningMarketplaceService.listTeacherOrganizations(),
    enabled: Boolean(user?.id),
  });
  const profiles = useQuery({
    queryKey: ["marketplace", "teacher-profiles", user?.id],
    queryFn: () => learningMarketplaceService.listTeacherProfiles(),
    enabled: Boolean(user?.id),
  });
  const reviewQueue = useQuery({
    queryKey: ["marketplace", "teacher-profile-review-queue", user?.id],
    queryFn: () => learningMarketplaceService.listProfilesForReview(),
    enabled: Boolean(user?.id),
    retry: false,
  });
  const save = useMutation({
    mutationFn: learningMarketplaceService.saveTeacherProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketplace", "teacher-profiles", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", "public-teacher-profiles"] }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", "teacher-profile-review-queue", user?.id] }),
      ]);
    },
  });
  const review = useMutation({
    mutationFn: learningMarketplaceService.reviewTeacherProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketplace", "teacher-profile-review-queue", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", "public-teacher-profiles"] }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", "teacher-profiles"] }),
      ]);
    },
  });

  if (!user) return null;
  const organizationList = organizations.data ?? [];
  const pendingReviews = reviewQueue.data ?? [];
  if (!organizations.isPending && !reviewQueue.isPending && organizationList.length === 0 && pendingReviews.length === 0) return null;

  return (
    <div className="space-y-5">
      {organizationList.length > 0 && (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-bold">Teacher profile</h2>
          <p className="mt-1 text-sm text-slate-500">Share your teaching experience, languages and qualifications. A school manager must review the profile before it displays a school-reviewed badge.</p>
          {organizations.isError && <Error message="Your teaching organizations could not be loaded." />}
          {profiles.isError && <Error message="Your teacher profile could not be loaded." />}
          {save.isError && <Error message={save.error.message} />}
          {organizationList.map(org => {
            const profile = (profiles.data ?? []).find(item => item.organization_id === org.organization_id);
            return (
              <ProfileEditor
                key={profile?.id ?? org.organization_id}
                profile={profile}
                organizationId={org.organization_id}
                organizationName={org.organization_name}
                pending={save.isPending}
                onSave={input => save.mutate(input)}
              />
            );
          })}
        </section>
      )}
      {pendingReviews.length > 0 && (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-bold">Teacher profiles awaiting school review</h2>
          <p className="mt-1 text-sm text-slate-500">Review only profiles for a school where you have academic-management permission. Verification is a school review, not an independent identity check.</p>
          {review.isError && <Error message={review.error.message} />}
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {pendingReviews.map(profile => (
              <ReviewCard
                key={profile.id}
                profile={profile}
                pending={review.isPending}
                onReview={(status, reviewNote) => review.mutate({ profileId: profile.id, status, reviewNote })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProfileEditor({ profile, organizationId, organizationName, pending, onSave }: {
  profile?: TeacherProfile;
  organizationId: string;
  organizationName: string;
  pending: boolean;
  onSave: (input: { organizationId: string; headline: string; bio: string; languages: string[]; credentials: string[]; experienceYears: number }) => void;
}) {
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [languages, setLanguages] = useState((profile?.languages ?? []).join(", "));
  const [credentials, setCredentials] = useState((profile?.credentials ?? []).join(", "));
  const [experienceYears, setExperienceYears] = useState(String(profile?.experience_years ?? 0));
  return (
    <form className="mt-4 border-t pt-4" onSubmit={event => {
      event.preventDefault();
      onSave({
        organizationId,
        headline: headline.trim(),
        bio: bio.trim(),
        languages: languages.split(",").map(value => value.trim()).filter(Boolean),
        credentials: credentials.split(",").map(value => value.trim()).filter(Boolean),
        experienceYears: Number(experienceYears),
      });
    }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{organizationName}</h3>
        {profile && <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (profile.review_status === "verified" ? "bg-emerald-100 text-emerald-800" : profile.review_status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800")}>{profile.review_status === "verified" ? "School reviewed" : profile.review_status === "rejected" ? "Changes requested" : "Pending review"}</span>}
      </div>
      {profile?.review_note && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">School feedback: {profile.review_note}</p>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className={label}>Headline
          <input className={field} value={headline} onChange={event => setHeadline(event.target.value)} minLength={5} maxLength={120} required placeholder="English teacher focused on speaking confidence" />
        </label>
        <label className={label}>Years of experience
          <input className={field} type="number" min="0" max="60" value={experienceYears} onChange={event => setExperienceYears(event.target.value)} required />
        </label>
        <label className={label}>Languages (comma-separated)
          <input className={field} value={languages} onChange={event => setLanguages(event.target.value)} maxLength={400} placeholder="English, Thai, Swahili" />
        </label>
        <label className={label}>Qualifications (comma-separated)
          <input className={field} value={credentials} onChange={event => setCredentials(event.target.value)} maxLength={1000} placeholder="B.Ed, TEFL" />
        </label>
        <label className={label + " md:col-span-2"}>Teaching biography
          <textarea className={field} rows={4} value={bio} onChange={event => setBio(event.target.value)} minLength={30} maxLength={3000} required placeholder="Describe your experience, approach and the learners you support." />
        </label>
      </div>
      <button disabled={pending} className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : profile ? "Save profile" : "Create profile"}</button>
    </form>
  );
}

function ReviewCard({ profile, pending, onReview }: {
  profile: TeacherProfileForReview;
  pending: boolean;
  onReview: (status: "verified" | "rejected", note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <article className="rounded-xl border p-4">
      <p className="text-xs font-semibold uppercase text-indigo-700">{profile.organization_name}</p>
      <h3 className="mt-1 font-bold">{profile.teacher_name}</h3>
      <p className="mt-1 text-sm font-semibold">{profile.headline}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6">{profile.bio}</p>
      <p className="mt-2 text-xs text-slate-500">{profile.experience_years} years · {(profile.languages ?? []).join(", ") || "Languages not listed"}</p>
      <p className="mt-1 text-xs text-slate-500">Qualifications: {(profile.credentials ?? []).join(", ") || "Not listed"}</p>
      <label className={label + " mt-3"}>Review note (optional)
        <textarea className={field} rows={2} value={note} onChange={event => setNote(event.target.value)} maxLength={1000} placeholder="Feedback for the teacher" />
      </label>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={pending} onClick={() => onReview("verified", note.trim())} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Mark school-reviewed</button>
        <button type="button" disabled={pending} onClick={() => onReview("rejected", note.trim())} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Request changes</button>
      </div>
    </article>
  );
}

function Error({ message }: { message: string }) {
  return <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</p>;
}
