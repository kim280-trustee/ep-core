import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningMarketplaceService } from "../services/learning-marketplace.service";
import type { TeacherAvailabilitySlot } from "../types/learning-marketplace.types";

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm";
const labelClass = "block text-sm font-medium text-slate-700";

export default function TeacherAvailabilityPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slotId, setSlotId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezoneName, setTimezoneName] = useState("Asia/Bangkok");
  const [active, setActive] = useState(true);

  const organizations = useQuery({
    queryKey: ["marketplace", "orgs", user?.id],
    queryFn: () => learningMarketplaceService.listTeacherOrganizations(),
    enabled: Boolean(user?.id),
  });
  const slots = useQuery({
    queryKey: ["marketplace", "teacher-availability", user?.id],
    queryFn: () => learningMarketplaceService.listTeacherAvailability(),
    enabled: Boolean(user?.id),
  });
  const selectedOrganizationId = organizationId || organizations.data?.[0]?.organization_id || "";
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["marketplace", "teacher-availability", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["marketplace", "public-availability"] }),
    ]);
  };
  const save = useMutation({
    mutationFn: () => {
      if (!selectedOrganizationId) throw new Error("Choose an organization where you are an active teacher.");
      if (startTime >= endTime) throw new Error("End time must be later than start time.");
      return learningMarketplaceService.saveAvailabilitySlot({
        slotId,
        organizationId: selectedOrganizationId,
        weekday: Number(weekday),
        startTime,
        endTime,
        timezoneName: timezoneName.trim(),
        active,
      });
    },
    onSuccess: async () => { await refresh(); reset(); },
  });
  const remove = useMutation({
    mutationFn: learningMarketplaceService.deleteAvailabilitySlot,
    onSuccess: refresh,
  });

  function reset() {
    setSlotId(null);
    setWeekday("1");
    setStartTime("16:00");
    setEndTime("18:00");
    setTimezoneName("Asia/Bangkok");
    setActive(true);
  }
  function edit(slot: TeacherAvailabilitySlot) {
    setSlotId(slot.id);
    setOrganizationId(slot.organization_id);
    setWeekday(String(slot.weekday));
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setTimezoneName(slot.timezone_name);
    setActive(slot.active);
  }

  if (!user || !organizations.data?.length) return null;
  const ownSlots = slots.data ?? [];

  return (
    <section className="rounded-2xl border bg-white p-5">
      <div>
        <h2 className="text-xl font-bold">Weekly teaching availability</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set recurring weekly windows so learners can see when you usually teach. Times are shown in the timezone you select; this does not confirm a booking.
        </p>
      </div>
      {organizations.isError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">Your teaching organizations could not be loaded.</p>}
      {slots.isError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">Your availability could not be loaded.</p>}
      {save.isError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{save.error.message}</p>}
      {remove.isError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{remove.error.message}</p>}
      <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={event => { event.preventDefault(); save.mutate(); }}>
        <label className={labelClass}>School
          <select className={inputClass} value={selectedOrganizationId} onChange={event => setOrganizationId(event.target.value)} required>
            {organizations.data.map(org => <option key={org.organization_id} value={org.organization_id}>{org.organization_name}</option>)}
          </select>
        </label>
        <label className={labelClass}>Day
          <select className={inputClass} value={weekday} onChange={event => setWeekday(event.target.value)}>
            {weekdays.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
          </select>
        </label>
        <label className={labelClass}>Timezone
          <input className={inputClass} value={timezoneName} onChange={event => setTimezoneName(event.target.value)} maxLength={64} required placeholder="Asia/Bangkok" />
        </label>
        <label className={labelClass}>Starts at
          <input className={inputClass} type="time" value={startTime} onChange={event => setStartTime(event.target.value)} required />
        </label>
        <label className={labelClass}>Ends at
          <input className={inputClass} type="time" value={endTime} onChange={event => setEndTime(event.target.value)} required />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />
          Visible to learners
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
          <button disabled={save.isPending} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {save.isPending ? "Saving…" : slotId ? "Update availability" : "Add availability"}
          </button>
          {slotId && <button type="button" onClick={reset} className="rounded-xl border px-4 py-2.5 text-sm">Cancel edit</button>}
        </div>
      </form>
      <div className="mt-5 border-t pt-4">
        <h3 className="font-semibold">Your weekly windows</h3>
        {slots.isPending ? <p className="mt-2 text-sm text-slate-500">Loading availability…</p> : ownSlots.length === 0 ? <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No availability has been added yet.</p> : (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {ownSlots.map(slot => <article key={slot.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <p className="font-semibold">{slot.organization_name} · {weekdays.find(day => day.value === slot.weekday)?.label ?? "Day"}</p>
                <p className="text-sm text-slate-600">{slot.start_time}–{slot.end_time} · {slot.timezone_name}</p>
                <p className="text-xs text-slate-500">{slot.active ? "Visible to learners" : "Hidden from learners"}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => edit(slot)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Edit</button>
                <button type="button" disabled={remove.isPending} onClick={() => remove.mutate(slot.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">Delete</button>
              </div>
            </article>)}
          </div>
        )}
      </div>
    </section>
  );
}
