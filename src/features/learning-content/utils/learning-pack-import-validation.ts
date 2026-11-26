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


export type ImportChunkKind = "lesson" | "question";

export function formatImportChunkFailure(input: { kind: ImportChunkKind; chunkNumber: number; totalChunks: number; error: unknown }): string {
  const detail = input.error instanceof Error ? input.error.message : "Unknown import error.";
  const label = input.kind === "lesson" ? "Lesson" : "Question";
  return `${label} chunk ${input.chunkNumber} of ${input.totalChunks} failed: ${detail} Earlier completed chunks are retained. The failed chunk attempts its own cleanup; inspect the draft library before retrying if the error reports a cleanup failure.`;
}


/** Normalize objective prose without discarding Thai or other Unicode scripts. */
export function normalizeLearningObjectiveText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[’']/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

/** Conservative token-overlap score for objective-description suggestions. */
export function scoreLearningObjectiveText(left: string, right: string): number {
  const ignored = new Set(["the", "and", "of", "to", "a", "an", "in", "for", "using", "use", "how", "what", "with", "from", "by", "on", "at", "as", "is", "are", "be", "that", "this", "their", "its", "into", "across"]);
  const tokens = (value: string) => new Set(
    normalizeLearningObjectiveText(value).split(" ")
      .map((token) => token.endsWith("ies") ? `${token.slice(0, -3)}y` : token.endsWith("s") ? token.slice(0, -1) : token)
      .filter((token) => token.length > 2 && !ignored.has(token)),
  );
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  let intersection = 0;
  leftTokens.forEach((token) => { if (rightTokens.has(token)) intersection += 1; });
  const sourceCoverage = intersection / leftTokens.size;
  const dice = (2 * intersection) / (leftTokens.size + rightTokens.size);
  return sourceCoverage * 0.7 + dice * 0.3;
}
