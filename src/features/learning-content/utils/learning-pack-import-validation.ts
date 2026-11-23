export type ExistingImportCodeConflicts = {
  contentCodes: string[];
  questionCodes: string[];
};

/** Canonical import-code normalization shared by preflight and persistence. */
export function normalizeLearningImportCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Pure collision detection, intentionally testable without a database session. */
export function findExistingImportCodeConflicts(input: {
  requestedContentCodes: string[];
  requestedQuestionCodes: string[];
  existingContentCodes: ReadonlySet<string>;
  existingQuestionCodes: ReadonlySet<string>;
}): ExistingImportCodeConflicts {
  const existingContent = new Set([...input.existingContentCodes].map(normalizeLearningImportCode));
  const existingQuestions = new Set([...input.existingQuestionCodes].map(normalizeLearningImportCode));
  return {
    contentCodes: [...new Set(input.requestedContentCodes.map(normalizeLearningImportCode).filter(Boolean))]
      .filter((code) => existingContent.has(code)),
    questionCodes: [...new Set(input.requestedQuestionCodes.map(normalizeLearningImportCode).filter(Boolean))]
      .filter((code) => existingQuestions.has(code)),
  };
}

export function formatExistingImportCodeConflict(conflicts: ExistingImportCodeConflicts): string | null {
  if (!conflicts.contentCodes.length && !conflicts.questionCodes.length) return null;
  const details = [
    conflicts.contentCodes.length
      ? `${conflicts.contentCodes.length} lesson code(s): ${conflicts.contentCodes.slice(0, 3).join(", ")}`
      : "",
    conflicts.questionCodes.length
      ? `${conflicts.questionCodes.length} question code(s): ${conflicts.questionCodes.slice(0, 3).join(", ")}`
      : "",
  ].filter(Boolean).join("; ");
  return `This organization already contains imported content codes (${details}). Resolve the existing drafts or use new import codes before retrying.`;
}

export type ResumableImportLesson = {
  contentImportCode: string;
  objectiveCode: string;
  questions: Array<{ code: string }>;
};

export type LearningPackImportPlan<T> = {
  lessonsToImport: T[];
  skippedLessons: number;
};

/**
 * Plan a safe lesson-pack retry from one organization-scoped preflight snapshot.
 * A lesson is skipped only when its parent and every expected question exist.
 * Any partial group is a hard stop; the importer never guesses how to repair it.
 */
export function planResumableLessonImport<T extends ResumableImportLesson>(
  lessons: T[],
  existingContentCodes: ReadonlySet<string>,
  existingQuestionCodes: ReadonlySet<string>,
): LearningPackImportPlan<T> {
  const contentCodes = new Set([...existingContentCodes].map(normalizeLearningImportCode));
  const questionCodes = new Set([...existingQuestionCodes].map(normalizeLearningImportCode));
  const lessonsToImport: T[] = [];
  let skippedLessons = 0;

  for (const lesson of lessons) {
    const contentExists = contentCodes.has(normalizeLearningImportCode(lesson.contentImportCode));
    const existingQuestionCount = lesson.questions.filter((question) =>
      questionCodes.has(normalizeLearningImportCode(question.code)),
    ).length;

    if (contentExists && existingQuestionCount === lesson.questions.length) {
      skippedLessons += 1;
      continue;
    }

    if (contentExists || existingQuestionCount > 0) {
      throw new Error(
        `The saved records for ${lesson.objectiveCode} are incomplete (lesson record: ${contentExists ? "yes" : "no"}; existing questions: ${existingQuestionCount}/${lesson.questions.length}). No records were overwritten. Inspect this objective's drafts before retrying.`,
      );
    }

    lessonsToImport.push(lesson);
  }

  return { lessonsToImport, skippedLessons };
}

/** Return only question codes absent from the same organization-scoped snapshot. */
export function selectNewImportQuestions<T extends { code: string }>(
  questions: T[],
  existingQuestionCodes: ReadonlySet<string>,
): { questionsToImport: T[]; skippedQuestions: number } {
  const existing = new Set([...existingQuestionCodes].map(normalizeLearningImportCode));
  const questionsToImport = questions.filter((question) =>
    !existing.has(normalizeLearningImportCode(question.code)),
  );
  return {
    questionsToImport,
    skippedQuestions: questions.length - questionsToImport.length,
  };
}
