export function extractTeacherPackGradeCode(objectiveCode: string | null | undefined): string | null {
  if (!objectiveCode) return null;
  if (/(?:^|[-_])M(?:46|4-6)(?:[-_])/i.test(objectiveCode)) return null;

  const directGrade = objectiveCode.match(/^([PM][1-6])[-_]/i)?.[1];
  if (directGrade) return directGrade.toUpperCase();

  // Subject-specific codes (for example SO2.1-P4-03, HPE-M1-01 and ARTS-P6-02)
  // place the grade after a hyphen. Shared M46 codes are handled separately below.
  return objectiveCode.match(/(?:^|[-_])([PM][1-6])(?:[-_])/i)?.[1]?.toUpperCase() ?? null;
}

export function extractTeacherPackGradeCodes(objectiveCode: string | null | undefined): string[] {
  if (objectiveCode?.match(/(?:^|[-_])M(?:46|4-6)(?:[-_])/i)) return ["M4", "M5", "M6"];
  const gradeCode = extractTeacherPackGradeCode(objectiveCode);
  return gradeCode ? [gradeCode] : [];
}

export type ParsedTeacherPackQuestion = {
  number: number;
  prompt: string;
  expectedAnswer: string;
};

export type ParsedTeacherPackLesson = {
  number: number;
  title: string;
  objectiveCode: string | null;
  objectiveText: string | null;
  outcomeNumber: number;
  learningOutcome: string;
  activity: string;
  packGuidance: string;
  questions: ParsedTeacherPackQuestion[];
};

export function parseTeacherPackMarkdown(markdown: string): ParsedTeacherPackLesson[] {
  if (!markdown.trim()) throw new Error("The selected Markdown file is empty.");
  if (markdown.length > 5_000_000) throw new Error("Teacher packs must be smaller than 5 MB.");

  const headingPattern = /^#{2,3}\s+(?:(?:(?:Physical|Earth) Science\s+)?(?:Lesson|Outcome)\s+(\d+)\s*[.:—–-]\s*(.+)|Group\s+\d+\s+[—–-]\s+Outcome\s+(\d+)\s*[:—–-]\s*(.+)|(\d+)\.\s+(.+)|(?:Lesson|Outcome)\s+[—–-]\s+(.+))$/gm;
  const headings = [...markdown.matchAll(headingPattern)];
  const guidanceHeadings = [...markdown.matchAll(/^##\s+(?!(?:(?:Physical|Earth) Science\s+)?(?:Lesson|Outcome)\s+\d|Group\s+\d+\s+[—–-]\s+Outcome\s+\d)([^#\n]*(?:safety|assessment|safeguarding|teacher guidance|teacher notes|teaching notes)[^#\n]*)\s*$/gim)];
  const packGuidance = guidanceHeadings.map((match) => {
    const start = (match.index ?? 0) + match[0].length;
    const remainder = markdown.slice(start);
    const nextHeading = remainder.search(/^##\s+/m);
    const body = (nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder).trim();
    return body ? `${match[1].trim()}:\n${body}` : "";
  }).filter(Boolean).join("\n\n");
  if (!headings.length) {
    throw new Error("No lesson sections were found. Use numbered Lesson/Outcome headings or headings such as '### 1. Lesson title'.");
  }

  return headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const number = Number(heading[1] ?? heading[3] ?? heading[5] ?? index + 1);
    const title = (heading[2] ?? heading[4] ?? heading[6] ?? heading[7] ?? `Lesson ${number}`).trim();
    // Prefer an explicit objective/code line. Some subject packs place a Thai-only
    // "Official indicator" line before the objective; treating that first line as
    // the objective hides the actual code and breaks grade/objective resolution.
    const objectiveLine = section.match(/^[ \t]*(?:[-*][ \t]*)?\*\*(?:Objective(?: code)?|Learning objective):\*\*\s*(.+)$/mi)?.[1]?.trim()
      ?? section.match(/^[ \t]*(?:[-*][ \t]*)?\*\*(?:Official indicator|Indicator(?: code)?):\*\*\s*(.+)$/mi)?.[1]?.trim()
      ?? "";
    const headingObjective = title.match(/^([A-Z][A-Z0-9._-]{3,})\s*[—–-]\s*(.+)$/i);
    const codeMatch = objectiveLine.match(/[\x60]([A-Z0-9][A-Z0-9._-]{2,})[\x60]/i)
      ?? objectiveLine.match(/^([A-Z][A-Z0-9._-]{3,})\s*(?:[—–:-]|$)/i)
      ?? objectiveLine.match(/\b(M[1-6][A-Z0-9_-]+)\b/i);
    const objectiveCode = (codeMatch?.[1] ?? headingObjective?.[1] ?? null)?.toUpperCase() ?? null;
    const objectiveText = (objectiveLine
      ? objectiveLine.replace(codeMatch?.[0] ?? "", "")
      : headingObjective?.[2] ?? "")
      .replace(/[\x60]/g, "")
      .replace(/^[\s—–:-]+/, "")
      .replace(/\s+/g, " ")
      .trim();

    const displayTitle = headingObjective || /^SO[1-5]\.\d-(?:P[1-6]|M[1-6]|M46)-\d+$/i.test(title)
      ? objectiveText || title
      : title;
    const learningOutcome = section.match(/^\*\*Learning outcomes?:\*\*\s*(.+)$/mi)?.[1]?.trim()
      ?? section.match(/^\*\*Outcome:\*\*\s*(.+)$/mi)?.[1]?.trim()
      ?? (objectiveText || displayTitle);

    const keyRelationships = section.match(/^\*\*Key relationships\*\*\s*([\s\S]*?)(?=^\*\*|^#{1,3}\s|(?![\s\S]))/mi)?.[1]?.trim();
    const activityParts = [
      section.match(/^[ \t]*(?:[-*][ \t]*)?\*\*Suggested (?:learning )?activity:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Practical activity:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*(?:กิจกรรมการเรียนรู้|กิจกรรมฝึกปฏิบัติ):\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Teaching activity:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Teaching sequence:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Practical task:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*กิจกรรมการเรียนรู้:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Starter(?:\s*\/\s*learning task)?:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Lesson starter(?:\s*\(\d+\s*minutes?\))?:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Teach(?: and practi[cs]e)?:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Learning task:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Check for understanding:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Learning focus:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      keyRelationships,
    ].filter((value): value is string => Boolean(value));
    const activity = activityParts.join("\n\n") || learningOutcome;

    const practicePattern = /^\*\*(?:Independent practice|Questions|Practice(?: questions)?|Answer-keyed questions|Formative assessment|Formative tasks|แบบฝึกปฏิบัติ|ภารกิจฝึกปฏิบัติ)\*\*\s*$/mi;
    const practiceMatch = section.match(practicePattern);
    const firstQuestion = section.search(/^\s*1\.\s+/m);
    const practice = practiceMatch
      ? section.slice(practiceMatch.index! + practiceMatch[0].length)
      : firstQuestion >= 0
        ? section.slice(firstQuestion)
        : "";
    const questions: ParsedTeacherPackQuestion[] = [];
    const lines = practice.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const questionLine = lines[lineIndex].match(/^\s*(\d+)\.\s+(.+?)\s*$/);
      if (!questionLine) continue;
      const inlineAnswer = questionLine[2].match(/\s+\*\*(?:Answer|Expected answer|Expected evidence|Expected answer\/evidence|แนวคำตอบ(?:\/หลักฐานที่คาดหวัง)?|คำตอบ):\*\*\s*(.+)$/i);
      const prompt = (inlineAnswer ? questionLine[2].slice(0, inlineAnswer.index) : questionLine[2]).trim();
      let expectedAnswer = inlineAnswer?.[1]?.trim() ?? "";
      if (!expectedAnswer) {
        const nextLine = lines[lineIndex + 1]?.match(/^\s*\*\*(?:Answer|Expected answer|Expected evidence|Expected answer\/evidence|แนวคำตอบ(?:\/หลักฐานที่คาดหวัง)?|คำตอบ):\*\*\s*(.+)$/i);
        if (nextLine) {
          expectedAnswer = nextLine[1].trim();
          lineIndex += 1;
        }
      }
      if (prompt && expectedAnswer) questions.push({ number: Number(questionLine[1]), prompt, expectedAnswer });
    }

    if (!objectiveCode && !objectiveText) throw new Error(`Lesson ${number} is missing its objective line.`);
    if (!activity) throw new Error(`Lesson ${number} is missing teaching notes or a learning focus.`);
    const questionNumbers = questions.map((question) => question.number);
    if (questionNumbers.length !== 3 || questionNumbers.some((questionNumber, index) => questionNumber !== index + 1)) {
      throw new Error(`Lesson ${number} must contain exactly three answer-keyed questions numbered 1, 2 and 3 in order; found ${questionNumbers.join(", ") || "none"}.`);
    }

    const markingGuide = section.match(/^\*\*Marking guide(?:\s*\([^)]*\))?:\*\*\s*(.+)$/mi)?.[1]?.trim();
    const lessonGuidance = [packGuidance, markingGuide ? `Marking guide: ${markingGuide}` : ""].filter(Boolean).join("\n\n");

    return {
      number,
      title: displayTitle,
      objectiveCode,
      objectiveText: objectiveCode ? null : objectiveText,
      outcomeNumber: number,
      learningOutcome,
      activity,
      packGuidance: lessonGuidance,
      questions,
    };
  });
}
