import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { supabase } from "@/core/infrastructure/supabase/client";
import { useAuth } from "./useAuth";

export type LearningAudience = "student" | "teacher" | "parent" | "school-admin";

type AccessState = "checking" | "allowed" | "denied" | "error";

interface Props {
  children: ReactNode;
  role: LearningAudience;
}

const roleLabels: Record<LearningAudience, string> = {
  student: "student account",
  teacher: "active teacher membership",
  parent: "active parent link",
  "school-admin": "school administration permission",
};

async function hasLearningAccess(userId: string, role: LearningAudience): Promise<boolean> {
  if (role === "student" || role === "teacher") {
    const { data, error } = await supabase
      .from("learning_class_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("membership_type", role)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  if (role === "parent") {
    const { data, error } = await supabase
      .from("learning_parent_student_links")
      .select("id")
      .eq("parent_user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipError) throw membershipError;
  const organizationIds = [...new Set((memberships ?? []).map((item) => item.organization_id))];
  if (organizationIds.length === 0) return false;

  // This database helper checks the active organization role's exact permission
  // and excludes active student memberships. It is the same predicate used by RLS.
  const permissionClient = supabase as unknown as {
    rpc: (
      functionName: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };

  const results = await Promise.all(
    organizationIds.map((organizationId) =>
      permissionClient.rpc("learning_can_manage_academic_records", {
        target_organization_id: organizationId,
      }),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  return results.some((result) => result.data === true);
}

export function LearningRoleRoute({ children, role }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<AccessState>("checking");
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    if (loading || !user) {
      setAccess("checking");
      return () => {
        active = false;
      };
    }

    setAccess("checking");
    setCheckedUserId(null);
    void hasLearningAccess(user.id, role)
      .then((allowed) => {
        if (active) {
          setAccess(allowed ? "allowed" : "denied");
          setCheckedUserId(user.id);
        }
      })
      .catch(() => {
        if (active) {
          setAccess("error");
          setCheckedUserId(user.id);
        }
      });

    return () => {
      active = false;
    };
  }, [loading, user, role, retry]);

  if (loading || (user && (checkedUserId !== user.id || access === "checking"))) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        Checking your access...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (access === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page requires an {roleLabels[role]}. Your account does not currently have that access.
          </p>
          <Link className="mt-5 inline-flex font-medium text-blue-700 hover:underline" to="/login">
            Return to sign in
          </Link>
        </section>
      </main>
    );
  }

  if (access === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Access could not be verified</h1>
          <p className="mt-2 text-sm text-slate-600">
            We could not verify your Learning permissions. No protected page content has been displayed.
          </p>
          <button
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            onClick={() => setRetry((value) => value + 1)}
            type="button"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
