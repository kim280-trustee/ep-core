import { withSupabase } from "npm:@supabase/server";

const ALLOWED_FORMATS = new Set(["lesson", "worksheet", "quiz", "lesson_plan"]);
const ALLOWED_LANGUAGES = new Set(["English", "Thai", "English and Thai"]);
const ALLOWED_DIFFICULTIES = new Set(["beginner", "developing", "on_level", "stretch"]);

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const body = await req.json();
      const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
      const subject = typeof body.subject === "string" ? body.subject.trim() : "";
      const gradeLevel = typeof body.gradeLevel === "string" ? body.gradeLevel.trim() : "";
      const topic = typeof body.topic === "string" ? body.topic.trim() : "";
      const objective = typeof body.objective === "string" ? body.objective.trim() : "";
      const format = typeof body.format === "string" ? body.format : "";
      const language = typeof body.language === "string" ? body.language : "English";
      const difficulty = typeof body.difficulty === "string" ? body.difficulty : "developing";

      if (!organizationId || !subject || !gradeLevel || !topic || !objective) {
        return Response.json({ error: "School, subject, grade, topic and learning objective are required." }, { status: 400 });
      }
      if (organizationId.length > 128 || subject.length > 100 || gradeLevel.length > 80 || topic.length > 200 || objective.length > 500) {
        return Response.json({ error: "One or more fields are too long. Shorten the request and try again." }, { status: 400 });
      }
      if (!ALLOWED_FORMATS.has(format) || !ALLOWED_LANGUAGES.has(language) || !ALLOWED_DIFFICULTIES.has(difficulty)) {
        return Response.json({ error: "Choose a supported material type, language and difficulty." }, { status: 400 });
      }

      const { data: membership, error: membershipError } = await ctx.supabase
        .from("learning_class_memberships")
        .select("user_id")
        .eq("user_id", ctx.user.id)
        .eq("organization_id", organizationId)
        .eq("membership_type", "teacher")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        return Response.json({ error: "Teacher access could not be verified. Refresh and try again." }, { status: 403 });
      }
      if (!membership) {
        return Response.json({ error: "You need an active teacher assignment in this school to use the AI assistant." }, { status: 403 });
      }

      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        return Response.json({ error: "AI generation is not configured yet. An administrator must add the OPENAI_API_KEY secret to Supabase Functions." }, { status: 503 });
      }

      const model = Deno.env.get("OPENAI_MODEL") || "gpt-5.5";
      const instructions = [
        "You are an assistant for a professional school teacher.",
        "Create a useful first draft aligned only to the teacher-provided subject, grade, topic and objective.",
        "Use age-appropriate, inclusive, culturally respectful material. Avoid collecting or requesting student names, contact details or other personal data.",
        "Do not claim alignment to an official curriculum standard unless the teacher supplied that standard.",
        "For quizzes, include an answer key and a brief explanation for each answer. Keep questions unambiguous.",
        "For worksheets, include clear learner instructions and a separate answer key.",
        "For lesson plans, include measurable objectives, materials, timed stages, checks for understanding and differentiation.",
        "For lessons, explain the concept, give worked examples, and include a short learner practice section.",
        "Return a teacher-editable draft in Markdown. Flag assumptions briefly at the end.",
        "This is a draft for teacher review; never state that it has been approved or published."
      ].join("\n");

      const input = [
        `Material type: ${format.replace("_", " ")}`,
        `Language: ${language}`,
        `Grade/level: ${gradeLevel}`,
        `Subject: ${subject}`,
        `Topic: ${topic}`,
        `Learning objective: ${objective}`,
        `Difficulty: ${difficulty}`,
        "",
        "Generate the draft now. Keep the content practical for a classroom and clearly separate the learner-facing material from the teacher answer key where applicable."
      ].join("\n");

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          instructions,
          input,
          max_output_tokens: 1800,
          store: false,
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("AI material generation provider error", response.status, detail.slice(0, 500));
        return Response.json({ error: "The AI service could not generate a draft right now. Try again later." }, { status: 502 });
      }

      const result = await response.json();
      const outputText = Array.isArray(result.output)
        ? result.output
            .filter((item: { type?: string }) => item?.type === "message")
            .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
            .filter((item: { type?: string }) => item?.type === "output_text")
            .map((item: { text?: string }) => item.text ?? "")
            .join("\n")
            .trim()
        : "";

      if (!outputText) {
        return Response.json({ error: "The AI service returned an empty draft. Please try again." }, { status: 502 });
      }

      return Response.json({
        draft: outputText,
        model: typeof result.model === "string" ? result.model : model,
        requiresTeacherReview: true,
      });
    } catch (error) {
      console.error("AI material generation request failed", error);
      return Response.json({ error: "The draft could not be generated. Check the request and try again." }, { status: 400 });
    }
  }),
};
