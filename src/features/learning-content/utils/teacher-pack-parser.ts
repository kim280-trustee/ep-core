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
  questions: ParsedTeacherPackQuestion[];
};

export function parseTeacherPackMarkdown(markdown: string): ParsedTeacherPackLesson[] {
  if (!markdown.trim()) throw new Error("The selected Markdown file is empty.");
  if (markdown.length > 5_000_000) throw new Error("Teacher packs must be smaller than 5 MB.");

  const headings = [...markdown.matchAll(/^#{2,3}\s+(?:Lesson|Outcome)\s+(\d+)\s+[—–-]\s+(.+)$/gm)];
  if (!headings.length) {
    throw new Error("No lesson or outcome sections were found. Use headings such as '## Lesson 1 — Title' or '## Outcome 1 — Title'.");
  }

  return headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const objectiveLine = section.match(/^\*\*Objective:\*\*\s*(.+)$/mi)?.[1]?.trim() ?? "";
    const codeMatch = objectiveLine.match(/[\x60]([A-Z0-9][A-Z0-9_-]{2,})[\x60]/i)
      ?? objectiveLine.match(/\b(M[1-6][A-Z0-9_-]+)\b/i);
    const objectiveCode = codeMatch?.[1]?.toUpperCase() ?? null;
    const objectiveText = objectiveLine
      .replace(codeMatch?.[0] ?? "", "")
      .replace(/[\x60]/g, "")
      .replace(/^[\s—–:-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const learningOutcome = section.match(/^\*\*Learning outcome:\*\*\s*(.+)$/mi)?.[1]?.trim()
      ?? (objectiveText || heading[2].trim());

    const activityParts = [
      section.match(/^\*\*Teaching activity:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Starter(?:\s*\/\s*learning task)?:\*\*\s*(.+)$/mi)?.[1]?.trim(),
      section.match(/^\*\*Teach(?: and practi[cs]e)?:\*\*\s*(.+)$/mi)?.[1]?.trim(),
    ].filter((value): value is string => Boolean(value));
    const activity = activityParts.join("\n\n");

    const practiceMatch = section.match(/^\*\*(?:Independent practice|Questions|Practice(?: questions)?|Answer-keyed questions)\*\*\s*$/mi);
    const practice = practiceMatch ? section.slice(practiceMatch.index! + practiceMatch[0].length) : "";
    const questions: ParsedTeacherPackQuestion[] = [];
    const lines = practice.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const questionLine = lines[lineIndex].match(/^\s*(\d+)\.\s+(.+?)\s*$/);
      if (!questionLine) continue;
      const inlineAnswer = questionLine[2].match(/\s+\*\*Answer:\*\*\s*(.+)$/i);
      const prompt = (inlineAnswer ? questionLine[2].slice(0, inlineAnswer.index) : questionLine[2]).trim();
      let expectedAnswer = inlineAnswer?.[1]?.trim() ?? "";
      if (!expectedAnswer) {
        const nextLine = lines[lineIndex + 1]?.match(/^\s*\*\*Answer:\*\*\s*(.+)$/i);
        if (nextLine) {
          expectedAnswer = nextLine[1].trim();
          lineIndex += 1;
        }
      }
      if (prompt && expectedAnswer) questions.push({ number: Number(questionLine[1]), prompt, expectedAnswer });
    }

    const number = Number(heading[1]);
    if (!objectiveCode && !objectiveText) throw new Error(\`Lesson \${number} is missing its **Objective:** line.\`);
    if (!activity) throw new Error(\`Lesson \${number} is missing teaching activity or starter/teach notes.\`);
    if (questions.length !== 3) {
      throw new Error(\`Lesson \${number} has \${questions.length} answer-keyed questions; exactly 3 are required.\`);
    }

    return {
      number,
      title: heading[2].trim(),
      objectiveCode,
      objectiveText: objectiveCode ? null : objectiveText,
      outcomeNumber: number,
      learningOutcome: learningOutcome || heading[2].trim(),
      activity,
      questions,
    };
  });
}
