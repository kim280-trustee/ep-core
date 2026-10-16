import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/core/infrastructure/supabase/client";

export default function StudentInvitationPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Accepting your student invitation…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let redirectTimer: number | undefined;

    async function accept() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data.session;
        const invitationId = session?.user?.user_metadata?.student_invitation_id;

        if (!session || !invitationId) {
          if (active) {
            setError("This invitation could not be opened. Use the invitation email link and sign in with the invited email address.");
            setStatus("");
          }
          return;
        }

        const { data: acceptedUserId, error: acceptError } = await supabase.rpc(
          "accept_learning_student_invitation",
          { p_invitation_id: String(invitationId) },
        );
        if (acceptError) throw acceptError;
        if (typeof acceptedUserId !== "string" || !acceptedUserId) {
          throw new Error("This invitation has expired or is no longer active. Ask the school to send a new invitation.");
        }
        if (active) {
          setStatus("Invitation accepted. Your class enrollment is complete. Redirecting to the student workspace…");
          redirectTimer = window.setTimeout(() => {
            if (active) navigate("/student", { replace: true });
          }, 500);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "The invitation could not be accepted.");
          setStatus("");
        }
      }
    }

    void accept();
    return () => {
      active = false;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <main className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
      {status && <p className="font-semibold text-slate-900">{status}</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}<p className="mt-3"><Link to="/student" className="underline">Open student workspace</Link></p></div>}
    </main>
  );
}
