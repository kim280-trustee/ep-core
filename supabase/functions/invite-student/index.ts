import { withSupabase } from "npm:@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let invitationId = "";
    try {
      const body = await req.json();
      const organizationId = String(body.organizationId ?? "").trim();
      const classGroupId = String(body.classGroupId ?? "").trim();
      const studentEmail = String(body.studentEmail ?? "").trim().toLowerCase();
      const studentName = String(body.studentName ?? "").trim();

      if (!organizationId || !classGroupId || !studentName || !studentEmail) {
        return Response.json({ error: "School, class, student name, and email are required" }, { status: 400 });
      }
      if (studentName.length > 120 || !/^\S+@\S+\.\S+$/.test(studentEmail) || studentEmail.length > 254) {
        return Response.json({ error: "Enter a valid student name and email address" }, { status: 400 });
      }

      const { data, error } = await ctx.supabase.rpc("create_learning_student_invitation", {
        p_organization_id: organizationId,
        p_class_group_id: classGroupId,
        p_student_email: studentEmail,
        p_student_name: studentName,
      });
      if (error) throw error;
      invitationId = String(data ?? "");
      if (!invitationId) throw new Error("The school invitation could not be created.");

      const appUrl = Deno.env.get("APP_URL");
      if (!appUrl) throw new Error("APP_URL is not configured for student invitations.");
      const parsedAppUrl = new URL(appUrl);
      if (parsedAppUrl.protocol !== "https:" && parsedAppUrl.hostname !== "localhost") {
        throw new Error("APP_URL must use HTTPS outside local development.");
      }
      const redirectTo = new URL("/student/invite", parsedAppUrl.origin).toString();

      const { error: inviteError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(studentEmail, {
        data: {
          name: studentName,
          student_invitation_id: invitationId,
        },
        redirectTo,
      });
      if (inviteError) {
        await ctx.supabase.rpc("revoke_learning_student_invitation", {
          p_invitation_id: invitationId,
        });
        return Response.json({ error: inviteError.message }, { status: 400 });
      }

      return Response.json({ invitationId, sent: true });
    } catch (error) {
      if (invitationId) {
        await ctx.supabase.rpc("revoke_learning_student_invitation", {
          p_invitation_id: invitationId,
        });
      }
      return Response.json({
        error: error instanceof Error ? error.message : "Student invitation failed",
      }, { status: 400 });
    }
  }),
};
