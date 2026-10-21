import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

type StaffRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  teachingAssignments: string[];
};

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";

export default function SchoolStaffAdministrationPage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-admin", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId || organizations[0]?.id || "";

  const staffQuery = useQuery({
    queryKey: ["school-admin", "staff", organizationId],
    queryFn: () => learningSchoolAdminService.listStaff(organizationId) as Promise<StaffRow[]>,
    enabled: Boolean(organizationId && canManage),
  });
  const staff = staffQuery.data ?? [];
  const statusMutation = useMutation({
    mutationFn: ({ membershipId, status }: { membershipId: string; status: "active" | "inactive" }) =>
      learningSchoolAdminService.setStaffMembershipStatus(membershipId, status),
    onSuccess: async (_result, input) => {
      setActionError("");
      setActionNotice(input.status === "inactive" ? "Staff membership deactivated." : "Staff membership reactivated.");
      await queryClient.invalidateQueries({ queryKey: ["school-admin", "staff", organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
    onError: (error) => {
      setActionNotice("");
      setActionError(error instanceof Error && error.message ? error.message : "Staff status could not be changed. Confirm your school-admin permission and try again.");
    },
  });
  const visibleStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return staff.filter((member) => {
      const matchesSearch = !normalizedSearch
        || member.name.toLocaleLowerCase().includes(normalizedSearch)
        || member.email.toLocaleLowerCase().includes(normalizedSearch)
        || member.teachingAssignments.some((assignment) => assignment.toLocaleLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staff, search, statusFilter]);
  const activeCount = staff.filter((member) => member.status === "active").length;
  const inactiveCount = staff.length - activeCount;

  if (authLoading || authorization.loading) {
    return <main className="mx-auto max-w-7xl p-8"><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /></main>;
  }
  if (!user) return <main className="mx-auto max-w-4xl p-8">Sign in to access staff administration.</main>;
  if (!canManage) {
    return <main className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950">
      <h1 className="text-xl font-semibold">School administration access required</h1>
      <p className="mt-2 text-sm">Your account needs the learning.academic.manage permission to view the staff directory.</p>
      <Link className="mt-4 inline-block text-sm font-semibold underline" to="/school-admin">Return to school administration</Link>
    </main>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-300">E&P Learning · School administration</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Staff directory</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Review staff accounts and their active teaching-class assignments. Only STAFF memberships can be activated or deactivated; owner and manager access cannot be changed here.</p>
          </div>
          <Link to="/school-admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">School setup</Link>
        </div>
        <label className="mt-5 block max-w-xl text-sm font-medium text-slate-200">School / organization
          <select className="mt-1 w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2.5 text-sm text-white" value={organizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)}>
            <option value="">Select school</option>
            {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name} ({organization.code})</option>)}
          </select>
        </label>
      </header>

      {actionError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{actionError}</div>}
      {actionNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{actionNotice}</div>}
      {organizationsQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load schools. Check your access and retry. <button className="ml-1 font-semibold underline" onClick={() => void organizationsQuery.refetch()}>Retry</button></div>}
      {staffQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load the staff directory. Confirm your school access and database permissions, then retry. <button className="ml-1 font-semibold underline" onClick={() => void staffQuery.refetch()}>Retry</button></div>}

      {organizationId && <>
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Staff accounts</p><p className="mt-2 text-3xl font-bold text-slate-950">{staff.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Active memberships</p><p className="mt-2 text-3xl font-bold text-slate-950">{activeCount}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Non-active memberships</p><p className="mt-2 text-3xl font-bold text-slate-950">{inactiveCount}</p></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-slate-950">Staff and teaching assignments</h2><p className="mt-1 text-sm text-slate-500">Assignments show active teacher memberships in classes belonging to this school.</p></div>
            <button type="button" className="text-sm font-semibold underline" onClick={() => void staffQuery.refetch()} disabled={staffQuery.isFetching}>{staffQuery.isFetching ? "Refreshing…" : "Refresh directory"}</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">Search staff or class
              <input className={fieldClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or class" />
            </label>
            <label className="text-sm font-medium text-slate-700">Membership status
              <select className={fieldClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option><option value="invited">Invited</option>
              </select>
            </label>
            <div className="flex items-end text-sm text-slate-500">{visibleStaff.length} of {staff.length} staff shown</div>
          </div>

          {staffQuery.isPending && <p className="mt-5 text-sm text-slate-500">Loading staff directory…</p>}
          {!staffQuery.isPending && !staffQuery.isError && staff.length === 0 && <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No staff-role memberships were found for this school. Staff accounts must have a STAFF organization membership to appear here.</p>}
          {!staffQuery.isPending && !staffQuery.isError && staff.length > 0 && visibleStaff.length === 0 && <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No staff match the current search and status filters.</p>}
          {!staffQuery.isError && visibleStaff.length > 0 && <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Staff member</th><th className="px-4 py-3">Teaching assignments</th><th className="px-4 py-3">Organization membership</th><th className="px-4 py-3">Access action</th></tr></thead>
              <tbody>{visibleStaff.map((member) => <tr key={member.membershipId} className="border-t border-slate-100 align-top">
                <td className="px-4 py-4"><p className="font-semibold text-slate-900">{member.name}</p><p className="mt-1 text-slate-500">{member.email || "No email on profile"}</p></td>
                <td className="px-4 py-4">{member.teachingAssignments.length ? <div className="flex flex-wrap gap-2">{member.teachingAssignments.map((assignment) => <span key={assignment} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{assignment}</span>)}</div> : <span className="text-slate-500">No active class assignment</span>}</td>
                <td className="px-4 py-4"><span className={member.status === "active" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"}>{member.status}</span></td>
                <td className="px-4 py-4">{member.status === "active" || member.status === "inactive" ? <button type="button" className="font-semibold underline disabled:cursor-not-allowed disabled:opacity-50" disabled={statusMutation.isPending} onClick={() => { setActionError(""); setActionNotice(""); statusMutation.mutate({ membershipId: member.membershipId, status: member.status === "active" ? "inactive" : "active" }); }}>{statusMutation.isPending ? "Saving…" : member.status === "active" ? "Deactivate" : "Reactivate"}</button> : <span className="text-xs text-slate-500">No action</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>}
        </section>
      </>}
      {!organizationId && !organizationsQuery.isPending && !organizationsQuery.isError && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No manageable school is available for this account.</p>}
    </main>
  );
}
