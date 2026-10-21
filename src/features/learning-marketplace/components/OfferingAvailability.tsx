import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function OfferingAvailability({ organizationId, teacherUserId }: { organizationId: string; teacherUserId: string }) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["marketplace", "public-availability"],
    queryFn: () => learningMarketplaceService.listPublicAvailability(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
  if (query.isPending) return <p className="mt-3 text-xs text-slate-500">Loading weekly availability…</p>;
  if (query.isError) return <p className="mt-3 text-xs text-amber-700">Weekly availability is temporarily unavailable.</p>;
  const slots = (query.data ?? []).filter(slot => slot.organization_id === organizationId && slot.teacher_user_id === teacherUserId);
  return (
    <div className="mt-3 rounded-xl bg-indigo-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900">Usual weekly availability</p>
      {slots.length === 0 ? <p className="mt-1 text-xs text-indigo-800">The teacher has not listed weekly availability yet. A request still needs confirmation.</p> : (
        <ul className="mt-1 space-y-1">
          {slots.map(slot => <li key={slot.weekday + "-" + slot.start_time + "-" + slot.end_time + "-" + slot.timezone_name} className="text-xs text-indigo-900">
            {weekdays[slot.weekday] ?? "Day"} · {slot.start_time}–{slot.end_time} ({slot.timezone_name})
          </li>)}
        </ul>
      )}
    </div>
  );
}
