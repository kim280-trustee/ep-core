import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";

export type LearningPackImportQuestion = {
  code: string;
  prompt: string;
  expectedAnswer: string;
  gradeLevelId?: string;
};

export type LearningPackImportLesson = {
  objectiveId: string;
  objectiveCode: string;
  gradeLevelId: string;
  title: string;
  learningOutcome: string;
  activity: string;
  teacherGuidance?: string;
  questions: LearningPackImportQuestion[];
};

export type LearningPackImportChunk = {
  organizationId: string;
  createdBy: string;
  curriculumId: string;
  subjectId: string;
  lessons: LearningPackImportLesson[];
};

export type LearningPackQuestionOnlyInput = {
  code: string;
  prompt: string;
  expectedAnswer: string;
  objectiveId: string;
  gradeLevelId: string;
};

export type LearningPackQuestionOnlyChunk = {
  organizationId: string;
  createdBy: string;
  curriculumId: string;
  subjectId: string;
  questions: LearningPackQuestionOnlyInput[];
};

export const learningPackImportRepository = {
  async importQuestionsOnly(input: LearningPackQuestionOnlyChunk) {
    if (!input.organizationId || !input.createdBy || !input.curriculumId || !input.subjectId || !input.questions.length) {
      throw new Error("A teacher, organization, curriculum, subject and at least one question are required.");
    }
    if (input.questions.some((question) =>
      !question.code.trim() || !question.prompt.trim() || !question.expectedAnswer.trim() ||
      !question.objectiveId || !question.gradeLevelId
    )) {
      throw new Error("Every question needs a code, prompt, answer key and exact aligned objective.");
    }
    const codes = input.questions.map((question) => makeImportCode(question.code));
    if (new Set(codes).size !== codes.length) throw new Error("The question-only pack contains duplicate question codes.");

    const createdQuestionIds: string[] = [];
    try {
      const questionRows: Database["public"]["Tables"]["learning_questions"]["Insert"][] =
        input.questions.map((question) => ({
          organization_id: input.organizationId,
          code: makeImportCode(question.code),
          question_type: "short_answer",
          language_code: "en",
          created_by: input.createdBy,
        }));
      const { data: questions, error: questionError } = await supabase
        .from("learning_questions")
        .insert(questionRows)
        .select("id,code");
      if (questionError) throw questionError;
      createdQuestionIds.push(...(questions ?? []).map((question) => question.id));
      const questionByCode = new Map((questions ?? []).map((question) => [question.code, question.id]));
      if (questionByCode.size !== input.questions.length) throw new Error("The question insert did not return every created question.");

      const versionRows: Database["public"]["Tables"]["learning_question_versions"]["Insert"][] =
        input.questions.map((question) => ({
          question_id: questionByCode.get(makeImportCode(question.code))!,
          version_no: 1,
          curriculum_id: input.curriculumId,
          grade_level_id: question.gradeLevelId,
          subject_id: input.subjectId,
          prompt: { text: question.prompt } as unknown as Json,
          configuration: { response_mode: "manual_review" } as unknown as Json,
          explanation: null,
          created_by: input.createdBy,
        }));
      const { data: versions, error: versionError } = await supabase
        .from("learning_question_versions")
        .insert(versionRows)
        .select("id,question_id");
      if (versionError) throw versionError;
      const versionByQuestionId = new Map((versions ?? []).map((version) => [version.question_id, version.id]));
      if (versionByQuestionId.size !== input.questions.length) throw new Error("The question-version insert did not return every created version.");

      for (const question of input.questions) {
        const questionId = questionByCode.get(makeImportCode(question.code))!;
        const questionVersionId = versionByQuestionId.get(questionId)!;
        const { error: evaluationError } = await supabase.rpc("save_learning_question_evaluation_key", {
          p_question_version_id: questionVersionId,
          p_evaluation_key: { expected_answer: question.expectedAnswer } as unknown as Json,
          p_scoring_rules: { method: "manual_review" } as unknown as Json,
        });
        if (evaluationError) throw evaluationError;
      }

      const objectiveRows: Database["public"]["Tables"]["learning_question_objectives"]["Insert"][] =
        input.questions.map((question) => ({
          question_version_id: versionByQuestionId.get(questionByCode.get(makeImportCode(question.code))!)!,
          objective_id: question.objectiveId,
          weight: 1,
        }));
      const { error: objectiveError } = await supabase
        .from("learning_question_objectives")
        .insert(objectiveRows);
      if (objectiveError) throw objectiveError;
      return { questions: questions?.length ?? 0 };
    } catch (error) {
      if (createdQuestionIds.length) {
        const { error: cleanupError } = await supabase.from("learning_questions").delete().in("id", createdQuestionIds);
        if (cleanupError) {
          const original = error instanceof Error ? error.message : "Unknown database error.";
          throw new Error(`${original} Cleanup also failed: ${cleanupError.message}. Check the draft question bank before retrying.`, { cause: error });
        }
      }
      throw error;
    }
  },

  async importChunk(input: LearningPackImportChunk) {
    if (!input.organizationId || !input.createdBy || !input.curriculumId || !input.subjectId || !input.lessons.length) {
      throw new Error("A teacher, organization, curriculum, subject and at least one lesson are required.");
    }
    if (input.lessons.some((lesson) =>
      !lesson.objectiveId || !lesson.objectiveCode || !lesson.gradeLevelId ||
      !lesson.title.trim() || !lesson.learningOutcome.trim() || !lesson.activity.trim() ||
      lesson.questions.length < 3 || lesson.questions.length % 3 !== 0
    )) {
      throw new Error("Every imported lesson needs an exact academic objective, grade, teaching content and three answer-keyed questions per grade.");
    }
    for (const lesson of input.lessons) {
      const counts = new Map<string, number>();
      for (const question of lesson.questions) {
        const gradeId = question.gradeLevelId ?? lesson.gradeLevelId;
        counts.set(gradeId, (counts.get(gradeId) ?? 0) + 1);
      }
      if ([...counts.values()].some((count) => count !== 3)) {
        throw new Error("Each grade-level question set must contain exactly three answer-keyed questions.");
      }
    }
    const contentCodes = input.lessons.map((lesson) => makeImportCode(`EP-${lesson.objectiveCode}-LESSON`));
    const questionCodes = input.lessons.flatMap((lesson) => lesson.questions.map((question) => question.code));
    if (new Set(contentCodes).size !== contentCodes.length || new Set(questionCodes).size !== questionCodes.length) {
      throw new Error("The import chunk contains duplicate content or question codes.");
    }

    const createdContentIds: string[] = [];
    const createdQuestionIds: string[] = [];

    try {
      const contentRows: Database["public"]["Tables"]["learning_content_items"]["Insert"][] =
        input.lessons.map((lesson) => ({
          organization_id: input.organizationId,
          code: makeImportCode(`EP-${lesson.objectiveCode}-LESSON`),
          title: lesson.title,
          content_type: "lesson",
          language_code: "en",
          created_by: input.createdBy,
          metadata: { source: "teacher_pack_import", objective_code: lesson.objectiveCode },
        }));

      const { data: contentItems, error: contentError } = await supabase
        .from("learning_content_items")
        .insert(contentRows)
        .select("id,code");
      if (contentError) throw contentError;
      const contentByCode = new Map((contentItems ?? []).map((item) => [item.code, item.id]));
      createdContentIds.push(...(contentItems ?? []).map((item) => item.id));
      if (contentByCode.size !== input.lessons.length) {
        throw new Error("The content insert did not return every created lesson.");
      }

      const contentVersionRows: Database["public"]["Tables"]["learning_content_versions"]["Insert"][] =
        input.lessons.map((lesson) => ({
          content_item_id: contentByCode.get(makeImportCode(`EP-${lesson.objectiveCode}-LESSON`))!,
          version_no: 1,
          body: {
            sections: [
              { type: "text", title: "Learning outcome", body: lesson.learningOutcome },
              { type: "text", title: "Teaching activity", body: lesson.activity },
              ...(lesson.teacherGuidance ? [{ type: "teacher_only", audience: "teacher", title: "Safety and teaching guidance", body: lesson.teacherGuidance }] : []),
              {
                type: "text",
                title: "Practice questions",
                body: lesson.questions.map((question, index) => `${index + 1}. ${question.prompt}`).join("\n"),
              },
            ],
            source: { type: "teacher_pack", objective_code: lesson.objectiveCode },
          } as unknown as Json,
          change_summary: "Imported as an initial teacher-reviewed draft from a curriculum teacher pack.",
          created_by: input.createdBy,
        }));
      const { error: contentVersionError } = await supabase
        .from("learning_content_versions")
        .insert(contentVersionRows);
      if (contentVersionError) throw contentVersionError;

      const contentObjectiveRows: Database["public"]["Tables"]["learning_content_objectives"]["Insert"][] =
        input.lessons.map((lesson) => ({
          content_item_id: contentByCode.get(makeImportCode(`EP-${lesson.objectiveCode}-LESSON`))!,
          objective_id: lesson.objectiveId,
          sequence_no: 1,
        }));
      const { error: contentObjectiveError } = await supabase
        .from("learning_content_objectives")
        .insert(contentObjectiveRows);
      if (contentObjectiveError) throw contentObjectiveError;

      const questionInputs = input.lessons.flatMap((lesson) =>
        lesson.questions.map((question) => ({
          ...question,
          objectiveId: lesson.objectiveId,
          curriculumGradeLevelId: question.gradeLevelId ?? lesson.gradeLevelId,
        })),
      );
      const questionRows: Database["public"]["Tables"]["learning_questions"]["Insert"][] =
        questionInputs.map((question) => ({
          organization_id: input.organizationId,
          code: question.code,
          question_type: "short_answer",
          language_code: "en",
          created_by: input.createdBy,
        }));
      const { data: questions, error: questionError } = await supabase
        .from("learning_questions")
        .insert(questionRows)
        .select("id,code");
      if (questionError) throw questionError;
      const questionByCode = new Map((questions ?? []).map((question) => [question.code, question.id]));
      createdQuestionIds.push(...(questions ?? []).map((question) => question.id));
      if (questionByCode.size !== questionInputs.length) {
        throw new Error("The question insert did not return every created question.");
      }

      const questionVersionRows: Database["public"]["Tables"]["learning_question_versions"]["Insert"][] =
        questionInputs.map((question) => ({
          question_id: questionByCode.get(question.code)!,
          version_no: 1,
          curriculum_id: input.curriculumId,
          grade_level_id: question.curriculumGradeLevelId,
          subject_id: input.subjectId,
          prompt: { text: question.prompt } as unknown as Json,
          configuration: { response_mode: "manual_review" } as unknown as Json,
          explanation: null,
          created_by: input.createdBy,
        }));
      const { data: versions, error: questionVersionError } = await supabase
        .from("learning_question_versions")
        .insert(questionVersionRows)
        .select("id,question_id");
      if (questionVersionError) throw questionVersionError;
      const versionByQuestionId = new Map((versions ?? []).map((version) => [version.question_id, version.id]));
      if (versionByQuestionId.size !== questionInputs.length) {
        throw new Error("The question-version insert did not return every created version.");
      }

      for (const question of questionInputs) {
        const questionVersionId = versionByQuestionId.get(questionByCode.get(question.code)!)!;
        const { error: evaluationKeyError } = await supabase.rpc("save_learning_question_evaluation_key", {
          p_question_version_id: questionVersionId,
          p_evaluation_key: { expected_answer: question.expectedAnswer } as unknown as Json,
          p_scoring_rules: { method: "manual_review" } as unknown as Json,
        });
        if (evaluationKeyError) throw evaluationKeyError;
      }

      const questionObjectiveRows: Database["public"]["Tables"]["learning_question_objectives"]["Insert"][] =
        questionInputs.map((question) => ({
          question_version_id: versionByQuestionId.get(questionByCode.get(question.code)!)!,
          objective_id: question.objectiveId,
          weight: 1,
        }));
      const { error: questionObjectiveError } = await supabase
        .from("learning_question_objectives")
        .insert(questionObjectiveRows);
      if (questionObjectiveError) throw questionObjectiveError;

      return {
        lessons: contentItems?.length ?? 0,
        questions: questions?.length ?? 0,
      };
    } catch (error) {
      const cleanupErrors: string[] = [];
      if (createdQuestionIds.length) {
        const { error: cleanupQuestionError } = await supabase.from("learning_questions").delete().in("id", createdQuestionIds);
        if (cleanupQuestionError) cleanupErrors.push(cleanupQuestionError.message);
      }
      if (createdContentIds.length) {
        const { error: cleanupContentError } = await supabase.from("learning_content_items").delete().in("id", createdContentIds);
        if (cleanupContentError) cleanupErrors.push(cleanupContentError.message);
      }
      if (cleanupErrors.length) {
        const original = error instanceof Error ? error.message : "Unknown database error.";
        throw new Error(`${original} Cleanup also reported: ${cleanupErrors.join("; ")}. Check the draft libraries before retrying.`, { cause: error });
      }
      throw error;
    }
  },
};

function makeImportCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}
