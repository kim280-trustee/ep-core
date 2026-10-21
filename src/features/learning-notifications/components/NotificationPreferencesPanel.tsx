import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, LoaderCircle } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningNotificationsService } from "../services/learning-notifications.service";
import type { LearningNotificationPreferenceType } from "../types/learning-notification.types";

const preferences: { type: LearningNotificationPreferenceType; label: string; description: string }[] = [
  { type: "marketplace.booking_requested", label: "New extra-class requests", description: "When a learner or parent requests a lesson from you." },
  { type: "marketplace.booking_confirmed", label: "Extra classes confirmed", description: "When a teacher confirms a lesson you requested." },
  { type: "marketplace.booking_declined", label: "Extra-class requests declined", description: "When a teacher declines a lesson request." },
  { type: "marketplace.booking_cancelled", label: "Extra classes cancelled", description: "When a booking you are involved in is cancelled." },
  { type: "learning.assignment_published", label: "New assignments", description: "When a new assignment is published for you or your class." },
  { type: "learning.assessment_result_available", label: "Assessment results", description: "When an evaluated assessment result becomes available." },
  { type: "learning.parent_assignment_published", label: "Child's new assignments", description: "When an actively linked child's assignment is published." },
  { type: "learning.parent_assessment_result_available", label: "Child's assessment results", description: "When an actively linked child's evaluated result becomes available." },
  { type: "school.parent_attendance_recorded", label: "Child attendance updates", description: "When the school submits an attendance register that includes your linked child." },
  { type: "school.student_invitation_accepted", label: "Student invitations accepted", description: "When a student accepts an invitation you issued for your school." },
  { type: "school.announcement_published", label: "School announcements", description: "When a school publishes a notice for your linked child or school." },
];

export default function NotificationPreferencesPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["learning-notifications", "preferences", user?.id];
  const query = useQuery({
    queryKey,
    queryFn: () => learningNotificationsService.getPreferences(),
    enabled: Boolean(user?.id),
  });
  const save = useMutation({
    mutationFn: (input: { notificationType: LearningNotificationPreferenceType; enabled: boolean }) =>
      learningNotificationsService.setPreference(input.notificationType, input.enabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  if (!user) return null;

  const saved = new Map((query.data ?? []).map((item) => [item.notification_type, item.in_app_enabled]));

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="notification-preferences-title">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><BellRing size={21} /></span>
        <div>
          <h2 id="notification-preferences-title" className="text-lg font-bold text-slate-950">Notification preferences</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Choose which routine events appear in your in-app inbox. New preferences default to on.</p>
        </div>
      </div>

      {query.isPending ? (
        <div className="flex items-center gap-2 py-3 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={16} /> Loading preferences…</div>
      ) : query.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Preferences could not be loaded. The notification-preferences migration may not be applied yet.
          <button type="button" className="ml-2 font-semibold underline" onClick={() => void query.refetch()}>Retry</button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {preferences.map((item) => {
            const enabled = saved.get(item.type) ?? true;
            const pending = save.isPending && save.variables?.notificationType === item.type;
            return (
              <label key={item.type} className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</span>
                </span>
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-indigo-600"
                  checked={enabled}
                  disabled={save.isPending}
                  aria-label={item.label}
                  onChange={(event) => save.mutate({ notificationType: item.type, enabled: event.currentTarget.checked })}
                />
                {pending && <span className="sr-only">Saving</span>}
              </label>
            );
          })}
        </div>
      )}

      {save.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">The preference was not saved. Try again.</p>}
      {save.isSuccess && <p role="status" className="text-sm font-medium text-emerald-700">Preference saved.</p>}
      <p className="text-xs leading-5 text-slate-500">Safety-report alerts to authorized school reviewers cannot be disabled here. These settings affect in-app notifications only; email, LINE and push are not connected.</p>
    </section>
  );
}
