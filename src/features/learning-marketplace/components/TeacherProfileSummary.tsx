import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";

export default function TeacherProfileSummary({ organizationId, teacherUserId }: { organizationId: string; teacherUserId: string }) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["marketplace", "public-teacher-profiles"],
    queryFn: () => learningMarketplaceService.listPublicTeacherProfiles(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
  if (query.isPending || query.isError) return null;
  const profile = (query.data ?? []).find(item => item.organization_id === organizationId && item.teacher_user_id === teacherUserId);
  if (!profile) return null;
  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{profile.headline}</p>
        {profile.school_reviewed && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">School reviewed</span>}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{profile.bio}</p>
      <p className="mt-2 text-xs text-slate-500">{profile.experience_years} years of experience · {(profile.languages ?? []).join(", ") || "Languages not listed"}</p>
      {(profile.credentials ?? []).length > 0 && <p className="mt-1 text-xs text-slate-500">Qualifications: {profile.credentials.join(", ")}</p>}
    </div>
  );
}
