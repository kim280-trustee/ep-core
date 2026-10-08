import { withSupabase } from "npm:@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
    try {
      const body = await req.json();
      const organizationId = String(body.organizationId ?? "");
      const parentEmail = String(body.parentEmail ?? "").trim().toLowerCase();
      const parentName = String(body.parentName ?? "").trim();
      const studentUserId = String(body.studentUserId ?? "");
      const relationship = String(body.relationship ?? "parent").trim() || "parent";

      if (!organizationId || !parentEmail || !studentUserId || !parentEmail.includes("@")) {
        return Response.json({ error: "Organization, parent email, and student are required" }, { status: 400 });
      }

      const { data: invitationId, error: invitationError } = await ctx.supabase.rpc(
        "create_learning_parent_invitation",
        {
          p_organization_id: organizationId,
          p_parent_email: parentEmail,
          p_parent_name: parentName || null,
          p_student_user_id: studentUserId,
          p_relationship: relationship,
        },
      );
      if (invitationError) throw invitationError;

      const origin = req.headers.get("Origin") ?? Deno.env.get("APP_URL");
      if (!origin) throw new Error("Application URL is not configured");
      const redirectTo = new URL("/parent/invite", origin).toString();

      const { error: inviteError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(parentEmail, {
        data: {
          name: parentName || undefined,
          parent_invitation_id: invitationId,
        },
        redirectTo,
      });
      if (inviteError) return Response.json({ error: inviteError.message, invitationId }, { status: 400 });

      return Response.json({ invitationId, sent: true });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Parent invitation failed" }, { status: 400 });
    }
  }),
};