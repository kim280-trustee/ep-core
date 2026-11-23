import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import {
  findExistingImportCodeConflicts,
  formatExistingImportCodeConflict,
  normalizeLearningImportCode,
} from "@/features/learning-content/utils/learning-pack-import-validation";

export type LearningPackImportQuestion = {
  code: string;
  prompt: string;
  expectedAnswer: string;
};

export type LearningPackImportLesson = {
  objectiveId: string;
  objectiveCode: string;
  contentImportCode?: string;
  gradeLevelId: string;
  title: string;
  learningOutcome: string;
  activity: string;
  teacherGuidance?: string;
  questions: LearningPackImportQuestion[];
};

export type LearningPackImportChunk = {
  languageCode: "en" | "th";
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
  languageCode: "en" | "th";
  organizationId: string;
  createdBy: string;
  curriculumId: string;
  subjectId: string;
  questions: LearningPackQuestionOnlyInput[];
};

const MAX_IMPORT_CHUNK_ITEMS = 40;

function assertExactUniqueValues(actualValues: string[], expectedValues: string[], description: string) {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  if (actualValues.length !== expectedValues.length || actual.size !== actualValues.length ||
      actual.size !== expected.size || [...expected].some((value) => !actual.has(value))) {
    throw new Error(`The database did not confirm the exact set of created ${description}. No success was reported.`);
  }
}

export const learningPackImportRepository = {
  async findExistingImportCodes(input: {
    organizationId: string;
    contentCodes: string[];
    questionCodes: string[];
  }) {
    // Keep PostgREST URL/query payloads bounded for large packs (the complete
    // Science rollout contains 715 lesson codes and 2,145 question codes).
    const lookupBatchSize = 100;
    const existingContentCodes = new Set<string>();
    const existingQuestionCodes = new Set<string>();
    const contentCodes: string[] = [...new Set(input.contentCodes.map(normalizeLearningImportCode).filter((code) => code.length > 0))];
    const questionCodes: string[] = [...new Set(input.questionCodes.map(normalizeLearningImportCode).filter((code) => code.length > 0))];

    for (let offset = 0; offset < contentCodes.length; offset += lookupBatchSize) {
      const batch = contentCodes.slice(offset, offset + lookupBatchSize);
      const { data, error } = await supabase
        .from("learning_content_items")
        .select("code")
        .eq("organization_id", input.organizationId)
        .in("code", batch);
      if (error) throw error;
      for (const item of data ?? []) existingContentCodes.add(normalizeLearningImportCode(item.code));
    }

    for (let offset = 0; offset < questionCodes.length; offset += lookupBatchSize) {
      const batch = questionCodes.slice(offset, offset + lookupBatchSize);
      const { data, error } = await supabase
        .from("learning_questions")
        .select("code")
        .eq("organization_id", input.organizationId)
        .in("code", batch);
      if (error) throw error;
      for (const item of data ?? []) existingQuestionCodes.add(normalizeLearningImportCode(item.code));
    }

    return {
      contentCodes: existingContentCodes,
      questionCodes: existingQuestionCodes,
    };
  },
  async verifyExistingQuestionImports(input: {
    organizationId: string;
    classGroupId: string;
    curriculumId: string;
    subjectId: string;
    languageCode: "en" | "th";
    questions: Array<LearningPackQuestionOnlyInput>;
  }) {
    const batchSize = 100;
    const integrity = new Map<string, { questionExists: boolean; isComplete: boolean; issue: string | null }>();
    const expectedCodes = input.questions.map((question) => normalizeLearningImportCode(question.code));
    if (expectedCodes.some((code) => !code) || new Set(expectedCodes).size !== expectedCodes.length) {
      throw new Error("Question completeness verification requires non-empty, unique normalized question codes. No retry decisions were made.");
    }
    for (let offset = 0; offset < input.questions.length; offset += batchSize) {
      const batch = input.questions.slice(offset, offset + batchSize);
      const batchCodes = new Set(batch.map((question) => normalizeLearningImportCode(question.code)));
      const expectedQuestions = batch.map((question) => ({
        code: normalizeLearningImportCode(question.code),
        prompt: question.prompt,
        expected_answer: question.expectedAnswer,
        objective_id: question.objectiveId,
        curriculum_id: input.curriculumId,
        grade_level_id: question.gradeLevelId,
        subject_id: input.subjectId,
        language_code: input.languageCode,
      }));
      const { data, error } = await supabase.rpc("verify_learning_pack_import_questions", {
        p_organization_id: input.organizationId,
        p_class_group_id: input.classGroupId,
        p_expected_questions: expectedQuestions as unknown as Json,
      });
      if (error) throw error;
      if ((data ?? []).length !== batch.length) {
        throw new Error("The database did not return a completeness result for every expected question. No retry decisions were made.");
      }
      const receivedCodes = new Set<string>();
      for (const row of data ?? []) {
        const code = normalizeLearningImportCode(row.question_code);
        if (!code || !batchCodes.has(code) || receivedCodes.has(code) ||
          typeof row.question_exists !== "boolean" || typeof row.is_complete !== "boolean" ||
          (row.issue !== null && typeof row.issue !== "string")) {
          throw new Error("The database returned an unexpected, duplicate or malformed question completeness result. No retry decisions were made.");
        }
        receivedCodes.add(code);
        integrity.set(code, {
          questionExists: row.question_exists,
          isComplete: row.is_complete,
          issue: row.issue,
        });
      }
      if (receivedCodes.size !== batch.length) {
        throw new Error("The database completeness response did not match the expected question codes. No retry decisions were made.");
      }
    }
    return integrity;
  },

  async findIncompleteExistingContentCodes(input: {
    organizationId: string;
    languageCode: "en" | "th";
    lessons: Array<LearningPackImportLesson & { contentImportCode: string }>;
  }) {
    const batchSize = 100;
    const incompleteCodes = new Set<string>();
    for (let offset = 0; offset < input.lessons.length; offset += batchSize) {
      const batch = input.lessons.slice(offset, offset + batchSize);
      const codes = batch.map((lesson) => normalizeLearningImportCode(lesson.contentImportCode));
      const { data: items, error: itemError } = await supabase
        .from("learning_content_items")
        .select("id,code,title,content_type,language_code,status,metadata")
        .eq("organization_id", input.organizationId)
        .in("code", codes);
      if (itemError) throw itemError;

      const itemByCode = new Map((items ?? []).map((item) => [normalizeLearningImportCode(item.code), item]));
      const itemIds = (items ?? []).map((item) => item.id);
      let versionRows: Array<{ content_item_id: string; version_no: number; status: string; body: Json }> = [];
      let objectiveRows: Array<{ content_item_id: string; objective_id: string }> = [];
      if (itemIds.length) {
        const [versionsResult, objectivesResult] = await Promise.all([
          supabase.from("learning_content_versions")
            .select("content_item_id,version_no,status,body")
            .in("content_item_id", itemIds),
          supabase.from("learning_content_objectives")
            .select("content_item_id,objective_id")
            .in("content_item_id", itemIds),
        ]);
        if (versionsResult.error) throw versionsResult.error;
        if (objectivesResult.error) throw objectivesResult.error;
        versionRows = versionsResult.data ?? [];
        objectiveRows = objectivesResult.data ?? [];
      }

      const versionsByItem = new Map<string, Array<{ content_item_id: string; version_no: number; status: string; body: Json }>>();
      for (const version of versionRows) {
        const rows = versionsByItem.get(version.content_item_id) ?? [];
        rows.push(version);
        versionsByItem.set(version.content_item_id, rows);
      }
      const objectivesByItem = new Map<string, Array<{ content_item_id: string; objective_id: string }>>();
      for (const objective of objectiveRows) {
        const rows = objectivesByItem.get(objective.content_item_id) ?? [];
        rows.push(objective);
        objectivesByItem.set(objective.content_item_id, rows);
      }

      for (const lesson of batch) {
        const code = normalizeLearningImportCode(lesson.contentImportCode);
        const item = itemByCode.get(code);
        if (!item) {
          incompleteCodes.add(code);
          continue;
        }
        const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
          ? item.metadata as Record<string, unknown>
          : {};
        const versions = versionsByItem.get(item.id) ?? [];
        const objectives = objectivesByItem.get(item.id) ?? [];
        const version = versions.length === 1 ? versions[0] : undefined;
        const body = version?.body && typeof version.body === "object" && !Array.isArray(version.body)
          ? version.body as Record<string, unknown>
          : {};
        const source = body.source && typeof body.source === "object" && !Array.isArray(body.source)
          ? body.source as Record<string, unknown>
          : {};
        const sections = Array.isArray(body.sections)
          ? body.sections.filter((section): section is Record<string, unknown> =>
            Boolean(section) && typeof section === "object" && !Array.isArray(section))
          : [];
        const hasSection = (title: string, expectedBody: string) =>
          sections.some((section) => section.title === title && section.body === expectedBody);
        const expectedPractice = lesson.questions.map((question, index) => String(index + 1) + ". " + question.prompt).join("\n");
        const guidanceMatches = !lesson.teacherGuidance || hasSection(
          "Teacher-only guidance and marking notes",
          lesson.teacherGuidance,
        );
        const complete =
          item.title === lesson.title &&
          item.content_type === "lesson" &&
          item.language_code === input.languageCode &&
          item.status === "draft" &&
          metadata.source === "teacher_pack_import" &&
          metadata.objective_code === lesson.objectiveCode &&
          version?.version_no === 1 &&
          version.status === "draft" &&
          source.objective_code === lesson.objectiveCode &&
          hasSection("Learning outcome", lesson.learningOutcome) &&
          hasSection("Teaching activity", lesson.activity) &&
          hasSection("Practice questions", expectedPractice) &&
          guidanceMatches &&
          objectives.length === 1 &&
          objectives[0].objective_id === lesson.objectiveId;
        if (!complete) incompleteCodes.add(code);
      }
    }
    return incompleteCodes;
  },

  async importQuestionsOnly(input: LearningPackQuestionOnlyChunk) {
    if (!input.languageCode || !input.organizationId || !input.createdBy || !input.curriculumId || !input.subjectId || !input.questions.length || input.questions.length > MAX_IMPORT_CHUNK_ITEMS) {
      throw new Error("A teacher, organization, curriculum, subject and between 1 and 40 questions per import chunk are required.");
    }
    if (input.questions.some((question) =>
      !question.code.trim() || !normalizeLearningImportCode(question.code) ||
      !question.prompt.trim() || !question.expectedAnswer.trim() ||
      !question.objectiveId || !question.gradeLevelId
    )) {
      throw new Error("Every question needs a valid code, prompt, answer key and exact aligned objective.");
    }
    const codes = input.questions.map((question) => normalizeLearningImportCode(question.code));
    if (new Set(codes).size !== codes.length) throw new Error("The question-only pack contains duplicate normalized question codes.");

    // Fail before writing anything when a previous attempt already created
    // one or more codes for this organization. The database uniqueness
    // constraint remains the final guard against concurrent imports.
    const existingCodes = await learningPackImportRepository.findExistingImportCodes({
      organizationId: input.organizationId,
      contentCodes: [],
      questionCodes: codes,
    });
    const conflicts = findExistingImportCodeConflicts({
      requestedContentCodes: [],
      requestedQuestionCodes: codes,
      existingContentCodes: existingCodes.contentCodes,
      existingQuestionCodes: existingCodes.questionCodes,
    });
    const conflictMessage = formatExistingImportCodeConflict(conflicts);
    if (conflictMessage) throw new Error(conflictMessage);

    const createdQuestionIds: string[] = [];
    try {
      const questionRows: Database["public"]["Tables"]["learning_questions"]["Insert"][] =
        input.questions.map((question) => ({
          organization_id: input.organizationId,
          code: normalizeLearningImportCode(question.code),
          question_type: "short_answer",
          language_code: input.languageCode,
          created_by: input.createdBy,
        }));
      const { data: questions, error: questionError } = await supabase
        .from("learning_questions")
        .insert(questionRows)
        .select("id,code");
      if (questionError) throw questionError;
      createdQuestionIds.push(...(questions ?? []).map((question) => question.id));
      const questionByCode = new Map((questions ?? []).map((question) => [normalizeLearningImportCode(question.code), question.id]));
      assertExactUniqueValues([...questionByCode.keys()], codes, "question parents");

      const versionRows: Database["public"]["Tables"]["learning_question_versions"]["Insert"][] =
        input.questions.map((question) => ({
          question_id: questionByCode.get(normalizeLearningImportCode(question.code))!,
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
      assertExactUniqueValues([...versionByQuestionId.keys()], [...questionByCode.values()], "question versions");

      await saveEvaluationKeys(input.questions.map((question) => ({
        questionVersionId: versionByQuestionId.get(questionByCode.get(normalizeLearningImportCode(question.code))!)!,
        expectedAnswer: question.expectedAnswer,
      })));

      const objectiveRows: Database["public"]["Tables"]["learning_question_objectives"]["Insert"][] =
        input.questions.map((question) => ({
          question_version_id: versionByQuestionId.get(questionByCode.get(normalizeLearningImportCode(question.code))!)!,
          objective_id: question.objectiveId,
          weight: 1,
        }));
      const { data: insertedQuestionObjectives, error: objectiveError } = await supabase
        .from("learning_question_objectives")
        .insert(objectiveRows)
        .select("question_version_id,objective_id");
      if (objectiveError) throw objectiveError;
      assertExactUniqueValues(
        (insertedQuestionObjectives ?? []).map((row) => `${row.question_version_id}:${row.objective_id}`),
        input.questions.map((question) => `${versionByQuestionId.get(questionByCode.get(normalizeLearningImportCode(question.code))!)!}:${question.objectiveId}`),
        "question objective links",
      );
      return { questions: questions?.length ?? 0 };
    } catch (error) {
      if (createdQuestionIds.length) {
        const { data: deletedQuestions, error: cleanupError } = await supabase
          .from("learning_questions")
          .delete()
          .in("id", createdQuestionIds)
          .select("id");
        if (cleanupError || (deletedQuestions?.length ?? 0) !== createdQuestionIds.length) {
          const cleanupMessage = cleanupError?.message ?? `Deleted ${deletedQuestions?.length ?? 0} of ${createdQuestionIds.length} created questions.`;
          const original = error instanceof Error ? error.message : "Unknown database error.";
          throw new Error(`${original} Cleanup could not confirm full removal: ${cleanupMessage}. Check the draft question bank before retrying.`, { cause: error });
        }
      }
      throw error;
    }
  },

  async importChunk(input: LearningPackImportChunk) {
    if (!input.languageCode || !input.organizationId || !input.createdBy || !input.curriculumId || !input.subjectId || !input.lessons.length || input.lessons.length > MAX_IMPORT_CHUNK_ITEMS) {
      throw new Error("A teacher, organization, curriculum, subject and between 1 and 40 lessons per import chunk are required.");
    }
    if (input.lessons.some((lesson) =>
      !lesson.objectiveId || !lesson.objectiveCode || !lesson.gradeLevelId ||
      !lesson.title.trim() || !lesson.learningOutcome.trim() || !lesson.activity.trim() ||
      lesson.questions.length !== 3 ||
      lesson.questions.some((question) =>
        !question.code.trim() || !normalizeLearningImportCode(question.code) ||
        !question.prompt.trim() || !question.expectedAnswer.trim()
      )
    )) {
      throw new Error("Every imported lesson needs an exact academic objective, grade, teaching content and three complete answer-keyed questions.");
    }
    const contentCodes = input.lessons.map((lesson) => normalizeLearningImportCode(lesson.contentImportCode ?? `EP-${lesson.objectiveCode}-LESSON`));
    const questionCodes = input.lessons.flatMap((lesson) => lesson.questions.map((question) => normalizeLearningImportCode(question.code)));
    if (contentCodes.some((code) => !code) || new Set(contentCodes).size !== contentCodes.length ||
      new Set(questionCodes).size !== questionCodes.length) {
      throw new Error("The import chunk contains an empty or duplicate normalized content/question code.");
    }

    // Detect codes left behind by earlier imports before creating any rows.
    // The unique database constraints still protect against concurrent runs.
    const existingCodes = await learningPackImportRepository.findExistingImportCodes({
      organizationId: input.organizationId,
      contentCodes,
      questionCodes,
    });
    const conflicts = findExistingImportCodeConflicts({
      requestedContentCodes: contentCodes,
      requestedQuestionCodes: questionCodes,
      existingContentCodes: existingCodes.contentCodes,
      existingQuestionCodes: existingCodes.questionCodes,
    });
    const conflictMessage = formatExistingImportCodeConflict(conflicts);
    if (conflictMessage) throw new Error(conflictMessage);

    const createdContentIds: string[] = [];
    const createdQuestionIds: string[] = [];

    try {
      const contentRows: Database["public"]["Tables"]["learning_content_items"]["Insert"][] =
        input.lessons.map((lesson) => ({
          organization_id: input.organizationId,
          code: normalizeLearningImportCode(lesson.contentImportCode ?? `EP-${lesson.objectiveCode}-LESSON`),
          title: lesson.title,
          content_type: "lesson",
          language_code: input.languageCode,
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
      assertExactUniqueValues([...contentByCode.keys()], contentCodes, "lesson parents");

      const contentVersionRows: Database["public"]["Tables"]["learning_content_versions"]["Insert"][] =
        input.lessons.map((lesson) => ({
          content_item_id: contentByCode.get(normalizeLearningImportCode(lesson.contentImportCode ?? `EP-${lesson.objectiveCode}-LESSON`))!,
          version_no: 1,
          body: {
            sections: [
              { type: "text", title: "Learning outcome", body: lesson.learningOutcome },
              { type: "text", title: "Teaching activity", body: lesson.activity },
              ...(lesson.teacherGuidance ? [{ type: "teacher_only", audience: "teacher", title: "Teacher-only guidance and marking notes", body: lesson.teacherGuidance }] : []),
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
      const { data: insertedContentVersions, error: contentVersionError } = await supabase
        .from("learning_content_versions")
        .insert(contentVersionRows)
        .select("id,content_item_id");
      if (contentVersionError) throw contentVersionError;
      assertExactUniqueValues(
        (insertedContentVersions ?? []).map((row) => row.content_item_id),
        [...contentByCode.values()],
        "lesson versions",
      );

      const contentObjectiveRows: Database["public"]["Tables"]["learning_content_objectives"]["Insert"][] =
        input.lessons.map((lesson) => ({
          content_item_id: contentByCode.get(normalizeLearningImportCode(lesson.contentImportCode ?? `EP-${lesson.objectiveCode}-LESSON`))!,
          objective_id: lesson.objectiveId,
          sequence_no: 1,
        }));
      const { data: insertedContentObjectives, error: contentObjectiveError } = await supabase
        .from("learning_content_objectives")
        .insert(contentObjectiveRows)
        .select("content_item_id,objective_id");
      if (contentObjectiveError) throw contentObjectiveError;
      assertExactUniqueValues(
        (insertedContentObjectives ?? []).map((row) => `${row.content_item_id}:${row.objective_id}`),
        input.lessons.map((lesson) => `${contentByCode.get(normalizeLearningImportCode(lesson.contentImportCode ?? `EP-${lesson.objectiveCode}-LESSON`))!}:${lesson.objectiveId}`),
        "lesson objective links",
      );

      const questionInputs = input.lessons.flatMap((lesson) =>
        lesson.questions.map((question) => ({
          ...question,
          code: normalizeLearningImportCode(question.code),
          objectiveId: lesson.objectiveId,
          curriculumGradeLevelId: lesson.gradeLevelId,
        })),
      );
      const questionRows: Database["public"]["Tables"]["learning_questions"]["Insert"][] =
        questionInputs.map((question) => ({
          organization_id: input.organizationId,
          code: question.code,
          question_type: "short_answer",
          language_code: input.languageCode,
          created_by: input.createdBy,
        }));
      const { data: questions, error: questionError } = await supabase
        .from("learning_questions")
        .insert(questionRows)
        .select("id,code");
      if (questionError) throw questionError;
      const questionByCode = new Map((questions ?? []).map((question) => [question.code, question.id]));
      createdQuestionIds.push(...(questions ?? []).map((question) => question.id));
      assertExactUniqueValues([...questionByCode.keys()], questionInputs.map((question) => question.code), "question parents");

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
      assertExactUniqueValues([...versionByQuestionId.keys()], [...questionByCode.values()], "question versions");

      await saveEvaluationKeys(questionInputs.map((question) => ({
        questionVersionId: versionByQuestionId.get(questionByCode.get(question.code)!)!,
        expectedAnswer: question.expectedAnswer,
      })));

      const questionObjectiveRows: Database["public"]["Tables"]["learning_question_objectives"]["Insert"][] =
        questionInputs.map((question) => ({
          question_version_id: versionByQuestionId.get(questionByCode.get(question.code)!)!,
          objective_id: question.objectiveId,
          weight: 1,
        }));
      const { data: insertedLessonQuestionObjectives, error: questionObjectiveError } = await supabase
        .from("learning_question_objectives")
        .insert(questionObjectiveRows)
        .select("question_version_id,objective_id");
      if (questionObjectiveError) throw questionObjectiveError;
      assertExactUniqueValues(
        (insertedLessonQuestionObjectives ?? []).map((row) => `${row.question_version_id}:${row.objective_id}`),
        questionInputs.map((question) => `${versionByQuestionId.get(questionByCode.get(question.code)!)!}:${question.objectiveId}`),
        "question objective links",
      );

      return {
        lessons: contentItems?.length ?? 0,
        questions: questions?.length ?? 0,
      };
    } catch (error) {
      const cleanupErrors: string[] = [];
      if (createdQuestionIds.length) {
        const { data: deletedQuestions, error: cleanupQuestionError } = await supabase
          .from("learning_questions")
          .delete()
          .in("id", createdQuestionIds)
          .select("id");
        if (cleanupQuestionError) cleanupErrors.push(cleanupQuestionError.message);
        else if ((deletedQuestions?.length ?? 0) !== createdQuestionIds.length) {
          cleanupErrors.push(`Deleted ${deletedQuestions?.length ?? 0} of ${createdQuestionIds.length} created questions.`);
        }
      }
      if (createdContentIds.length) {
        const { data: deletedContent, error: cleanupContentError } = await supabase
          .from("learning_content_items")
          .delete()
          .in("id", createdContentIds)
          .select("id");
        if (cleanupContentError) cleanupErrors.push(cleanupContentError.message);
        else if ((deletedContent?.length ?? 0) !== createdContentIds.length) {
          cleanupErrors.push(`Deleted ${deletedContent?.length ?? 0} of ${createdContentIds.length} created lessons.`);
        }
      }
      if (cleanupErrors.length) {
        const original = error instanceof Error ? error.message : "Unknown database error.";
        throw new Error(`${original} Cleanup also reported: ${cleanupErrors.join("; ")}. Check the draft libraries before retrying.`, { cause: error });
      }
      throw error;
    }
  },
};


async function saveEvaluationKeys(
  entries: Array<{ questionVersionId: string; expectedAnswer: string }>,
) {
  // Evaluation keys intentionally have no authenticated table INSERT policy.
  // Use the trusted SECURITY DEFINER RPC, which verifies active teacher
  // membership/academic permission and refuses writes to published versions.
  // Small settled batches avoid flooding the RPC endpoint and ensure all
  // in-flight calls finish before the caller begins failed-chunk cleanup.
  const concurrency = 10;
  for (let offset = 0; offset < entries.length; offset += concurrency) {
    const batch = entries.slice(offset, offset + concurrency);
    const results = await Promise.allSettled(batch.map((entry) =>
      supabase.rpc("save_learning_question_evaluation_key", {
        p_question_version_id: entry.questionVersionId,
        p_evaluation_key: { expected_answer: entry.expectedAnswer } as unknown as Json,
        p_scoring_rules: { method: "manual_review" } as unknown as Json,
      }),
    ));
    const failed = results.find((result) =>
      result.status === "rejected" || (result.status === "fulfilled" && result.value.error),
    );
    if (failed?.status === "rejected") throw failed.reason;
    if (failed?.status === "fulfilled" && failed.value.error) throw failed.value.error;
  }
}
