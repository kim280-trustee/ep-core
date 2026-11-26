export type StudentVisibleContentSection = {
  type: string;
  title: string | null;
  body: string;
  instructions: string;
  starterCode: string;
  requirements: string;
};

/**
 * Convert a stored content version into the safe student-facing section shape.
 * Teacher-only metadata and legacy teacher-guidance sections are excluded here,
 * at the rendering boundary, rather than relying on authoring conventions.
 */
export function getStudentVisibleContentSections(body: Record<string, unknown>): StudentVisibleContentSection[] {
  const raw = body.sections;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((section): StudentVisibleContentSection[] => {
    if (!section || typeof section !== "object" || Array.isArray(section)) return [];
    const record = section as Record<string, unknown>;
    const title = typeof record.title === "string"
      ? record.title.normalize("NFKC").toLocaleLowerCase().replace(/[\s_-]+/gu, " ").trim()
      : "";
    const audience = typeof record.audience === "string" ? record.audience.toLocaleLowerCase() : "";
    const visibility = typeof record.visibility === "string" ? record.visibility.toLocaleLowerCase() : "";

    // Treat explicit privacy metadata as authoritative. Also block common
    // teacher-facing labels because older packs predate the audience field.
    // The returned object below is deliberately allow-listed; arbitrary source
    // properties (including answer keys and internal notes) are never spread.
    if (
      record.type === "teacher_only" ||
      record.teacherOnly === true ||
      record.isTeacherOnly === true ||
      audience === "teacher" ||
      audience === "staff" ||
      visibility === "teacher" ||
      visibility === "staff" ||
      visibility === "private" ||
      /(?:answer\s*key|marking\s*guide|mark\s*scheme|teacher\s*guidance|teacher\s*notes|teaching\s*notes|staff\s*notes|assessor\s*notes|moderation\s*notes|teacher\s*rubric|teacher\s*only|safety\s+and\s+teaching\s+guidance)/u.test(title)
    ) return [];

    const sectionType = typeof record.type === "string" ? record.type : "text";
    const bodyText = typeof record.body === "string" ? record.body.trim() : "";

    if (sectionType === "code_activity") {
      return [{
        type: sectionType,
        title: typeof record.title === "string" ? record.title : "Coding activity",
        body: bodyText,
        instructions: typeof record.instructions === "string" ? record.instructions : "",
        starterCode: typeof record.starterCode === "string" ? record.starterCode : "",
        requirements: "",
      }];
    }

    if (sectionType === "project_activity") {
      return [{
        type: sectionType,
        title: typeof record.title === "string" ? record.title : "Practical project",
        body: bodyText,
        instructions: typeof record.instructions === "string" ? record.instructions : bodyText,
        starterCode: "",
        requirements: typeof record.requirements === "string" ? record.requirements : "",
      }];
    }

    if (!bodyText) return [];
    return [{
      type: sectionType,
      title: typeof record.title === "string" ? record.title : null,
      body: bodyText,
      instructions: "",
      starterCode: "",
      requirements: "",
    }];
  });
}
