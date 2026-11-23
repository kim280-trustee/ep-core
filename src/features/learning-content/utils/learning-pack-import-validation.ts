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
