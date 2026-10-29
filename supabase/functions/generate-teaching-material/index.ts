import { withSupabase } from "npm:@supabase/server";

const ALLOWED_FORMATS = new Set(["lesson", "worksheet", "quiz", "lesson_plan", "differentiated_pack"]);
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
      const country = typeof body.country === "string" ? body.country.trim() : "";
      const educationSystem = typeof body.educationSystem === "string" ? body.educationSystem.trim() : "";
      const curriculumReference = typeof body.curriculumReference === "string" ? body.curriculumReference.trim() : "";
      const durationMinutes = body.durationMinutes === undefined ? 50 : Number(body.durationMinutes);
      const priorKnowledge = typeof body.priorKnowledge === "string" ? body.priorKnowledge.trim() : "";
      const availableMaterials = typeof body.availableMaterials === "string" ? body.availableMaterials.trim() : "";
      const teacherNeeds = typeof body.teacherNeeds === "string" ? body.teacherNeeds.trim() : "";

      if (!organizationId || !subject || !gradeLevel || !topic || !objective) {
        return Response.json({ error: "School, subject, grade, topic and learning objective are required." }, { status: 400 });
      }
      if (
        organizationId.length > 128 || subject.length > 100 || gradeLevel.length > 80 ||
        topic.length > 200 || objective.length > 500 || country.length > 100 ||
        educationSystem.length > 120 || curriculumReference.length > 500 ||
        priorKnowledge.length > 1000 || availableMaterials.length > 1000 ||
        teacherNeeds.length > 1000
      ) {
        return Response.json({ error: "One or more fields are too long. Shorten the request and try again." }, { status: 400 });
      }
      if (
        !ALLOWED_FORMATS.has(format) || !ALLOWED_LANGUAGES.has(language) ||
        !ALLOWED_DIFFICULTIES.has(difficulty) ||
        !Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 240
      ) {
        return Response.json({ error: "Choose a supported material type, language and difficulty." }, { status: 400 });
      }

      const { data: authData, error: authError } = await ctx.supabase.auth.getUser();
      const authenticatedUser = authData.user;
      if (authError || !authenticatedUser) {
        return Response.json({ error: "Sign in again before generating teaching material." }, { status: 401 });
      }

      if (Deno.env.get("AI_TEACHER_ASSISTANT_ENABLED") !== "true") {
        return Response.json({ error: "AI drafting is currently disabled by the school administrator." }, { status: 503 });
      }

      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        return Response.json({ error: "AI generation is not configured yet. An administrator must add the OPENAI_API_KEY secret to Supabase Functions." }, { status: 503 });
      }

      const model = Deno.env.get("OPENAI_MODEL") || "gpt-5.5";
      // The database RPC maps auth.uid() to public.users.id, verifies active teacher membership
      // in this organization, and atomically reserves a slot in the server-enforced rolling quota.
      const { data: quotaRows, error: quotaError } = await ctx.supabase.rpc(
        "reserve_learning_ai_generation",
        { p_organization_id: organizationId, p_model: model },
      );

      if (quotaError) {
        const reason = quotaError.message.toLowerCase();
        if (
          reason.includes("active teacher assignment") ||
          reason.includes("profile not found") ||
          reason.includes("authentication required")
        ) {
          return Response.json({ error: "You need an active teacher assignment in this school to use the AI assistant." }, { status: 403 });
        }
        console.error("AI generation quota reservation failed", quotaError.message);
        return Response.json({ error: "AI usage controls are not available. An administrator must apply the AI usage-limit migration before generation can be used." }, { status: 503 });
      }

      const quota = Array.isArray(quotaRows) ? quotaRows[0] : null;
      if (!quota || typeof quota.allowed !== "boolean") {
        console.error("AI generation quota RPC returned an invalid response");
        return Response.json({ error: "AI usage controls returned an invalid response. Please contact an administrator." }, { status: 503 });
      }

      if (!quota.allowed) {
        return Response.json({
          error: `Daily AI draft limit reached (${quota.daily_limit} requests per 24 hours). Try again after ${quota.reset_at}.`,
          usage: {
            usedLast24Hours: quota.used_last_24_hours,
            dailyLimit: quota.daily_limit,
            remainingRequests: 0,
            resetAt: typeof quota.reset_at === "string" ? quota.reset_at : null,
          },
        }, { status: 429 });
      }

      const instructions = [
        "You are an assistant for a professional school teacher.",
        "Create a useful first draft aligned only to the teacher-provided subject, grade, topic, objective and any explicitly supplied curriculum reference.",
        "Treat country, education system and curriculum references as user-provided context, not proof of official curriculum approval. If no curriculum reference is supplied, say the teacher should verify alignment locally.",
        "The teacher may have limited proficiency in the lesson's teaching language. Make the teacher-facing explanation clear, practical and confidence-building.",
        "When the requested output language is English and the country is Thailand, include Thai-language teacher explanations alongside simple, accurate English classroom examples where relevant. When English and Thai are requested, use clearly labelled English and Thai sections.",
        "For language lessons, include model sentences, translations, common learner errors and practical classroom phrases where appropriate. Do not claim to provide generated audio or speech recognition.",
        "For lesson plans, respect the requested lesson duration and divide stages so their timings add up to that duration.",
        "Use age-appropriate, inclusive, culturally respectful material. Avoid collecting or requesting student names, contact details or other personal data.",
        "Do not claim alignment to an official curriculum standard unless the teacher supplied that standard.",
        "For quizzes, include an answer key and a brief explanation for each answer. Keep questions unambiguous.",
        "For worksheets, include clear learner instructions and a separate answer key.",
        "For lesson plans, include measurable objectives, materials, timed stages, checks for understanding and differentiation.",
        "For lessons, explain the concept, give worked examples, and include a short learner practice section.",
        "For differentiated packs, create three clearly separated versions of the same learning task: supported (scaffolds and sentence starters), core (grade-appropriate expected level), and stretch (deeper reasoning or extension). Keep all three aligned to the same learning objective, include learner instructions, and add one shared teacher answer key plus guidance for grouping and adapting support. Do not label learners or imply fixed ability.",
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
        `Country: ${country || "Not specified"}`,
        `Education system: ${educationSystem || "Not specified"}`,
        `Teacher-supplied curriculum reference: ${curriculumReference || "Not supplied; do not invent standards"}`,
        `Lesson duration in minutes: ${durationMinutes}`,
        `Prior knowledge: ${priorKnowledge || "Not specified; state reasonable assumptions"}`,
        `Available teaching materials: ${availableMaterials || "Not specified"}`,
        `Teacher support needs: ${teacherNeeds || "Not specified"}`,
        "",
        format === "differentiated_pack" ? "Generate a complete differentiated lesson pack with supported, core and stretch tasks, learner instructions, a shared answer key, and teacher guidance for using the three versions." : "Generate the requested material in a practical classroom-ready structure.",
        "Keep teacher-facing guidance, learner-facing material and answer keys clearly separated where applicable. Include a brief assumptions and local-verification note. Never invent a curriculum standard, endorsement, student data or unavailable audio capability."
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
          max_output_tokens: format === "differentiated_pack" ? 3000 : 1800,
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
        usage: {
          usedLast24Hours: quota.used_last_24_hours,
          dailyLimit: quota.daily_limit,
          remainingRequests: Math.max(0, quota.daily_limit - quota.used_last_24_hours),
          resetAt: typeof quota.reset_at === "string" ? quota.reset_at : null,
        },
      });
    } catch (error) {
      console.error("AI material generation request failed", error);
      return Response.json({ error: "The draft could not be generated. Check the request and try again." }, { status: 400 });
    }
  }),
};
