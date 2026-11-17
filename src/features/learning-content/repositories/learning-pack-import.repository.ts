import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";

export type LearningPackImportQuestion = {
  code: string;
  prompt: string;
  expectedAnswer: string;
};

export type LearningPackImportLesson = {
  objectiveId: string;
  objectiveCode: string;
  gradeLevelId: string;
  title: string;
  learningOutcome: string;
  activity: string;
  questions: LearningPackImportQuestion[];
};

export type LearningPackImportChunk = {
  organizationId: string;
  createdBy: string;
  lessons: LearningPackImportLesson[];
};

export const learningPackImportRepository = {
  async importChunk(input: LearningPackImportChunk) {
    if (!input.organizationId || !input.createdBy || !input.lessons.length) {
      throw new Error("A teacher, organization and at least one lesson are required.");
    }
    if (input.lessons.some((lesson) => lesson.questions.length !== 3)) {
      throw new Error("Every lesson must contain exactly three answer-keyed questions.");
    }

    const createdContentIds: string[] = [];
    const createdQuestionIds: string[] = [];

    try {
      const contentRows: Database["public"]["Tables"]["learning_content_items"]["Insert"][] =
        input.lessons.map((lesson) => ({
          organization_id: input.organizationId,
          code: `EP-${lesson.objectiveCode}-LESSON`,
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
          content_item_id: contentByCode.get(`EP-${lesson.objectiveCode}-LESSON`)!,
          version_no: 1,
          body: {
            sections: [
              { type: "text", title: "Learning outcome", body: lesson.learningOutcome },
              { type: "text", title: "Teaching activity", body: lesson.activity },
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
          content_item_id: contentByCode.get(`EP-${lesson.objectiveCode}-LESSON`)!,
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
          curriculumGradeLevelId: lesson.gradeLevelId,
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
          curriculum_id: input.lessons.find((lesson) => lesson.objectiveId === question.objectiveId) ? undefined : undefined,
          grade_level_id: question.curriculumGradeLevelId,
          subject_id: undefined,
          prompt: { text: question.prompt } as unknown as Json,
          configuration: { response_mode: "manual_review" } as unknown as Json,
          explanation: null,
          created_by: input.createdBy,
        }));
      const { error: questionVersionError } = await supabase
        .from("learning_question_versions")
        .insert(questionVersionRows);
      if (questionVersionError) throw questionVersionError;

      const questionIds = (questions ?? []).map((question) => question.id);
      const { data: versions, error: versionsError } = await supabase
        .from("learning_question_versions")
        .select("id,question_id")
        .in("question_id", questionIds);
      if (versionsError) throw versionsError;
      const versionByQuestionId = new Map((versions ?? []).map((version) => [version.question_id, version.id]));
      if (versionByQuestionId.size !== questionInputs.length) {
        throw new Error("The question-version insert did not return every created version.");
      }

      const evaluationKeyRows: Database["public"]["Tables"]["learning_question_evaluation_keys"]["Insert"][] =
        questionInputs.map((question) => ({
          question_version_id: versionByQuestionId.get(questionByCode.get(question.code)!)!,
          evaluation_key: { expected_answer: question.expectedAnswer } as unknown as Json,
          scoring_rules: { method: "manual_review" } as unknown as Json,
        }));
      const { error: evaluationKeyError } = await supabase
        .from("learning_question_evaluation_keys")
        .insert(evaluationKeyRows);
      if (evaluationKeyError) throw evaluationKeyError;

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
      if (createdQuestionIds.length) {
        await supabase.from("learning_questions").delete().in("id", createdQuestionIds);
      }
      if (createdContentIds.length) {
        await supabase.from("learning_content_items").delete().in("id", createdContentIds);
      }
      throw error;
    }
  },
};
