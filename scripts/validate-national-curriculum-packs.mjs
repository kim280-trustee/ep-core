import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const patterns = {
  thai: /\bTH[1-5]\.\d-(?:P[1-6]|M[1-6]|M4-6)-\d{2}\b/g,
  maths: /\bM[1-6]-K[1-3]_[1-3]-\d{2}\b/g,
  science: /\b(?:P[1-6]|M[1-6])-S[1-4]_[1-4]-\d{2}\b/g,
  social: /\bSO[1-5]\.\d-(?:P[1-6]|M[1-6]|M46)-\d{2}\b/g,
  health: /\bHPE-(?:P[1-6]|M[1-6]|M46)-\d{2}\b/g,
  arts: /\bARTS-(?:P[1-6]|M[1-6]|M46)-\d{2}\b/g,
  career: /\bCAREER-(?:P[1-6]|M[1-6]|M46)-\d{2}\b/g,
  foreign: /\bFL-(?:P[1-6]|M[1-6]|M46)-\d{2}\b/g,
};

const packs = [
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-P1-P3-TEACHER-STARTER-PACK.md", expected: 80, pattern: patterns.thai },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-P4-P6-TEACHER-STARTER-PACK.md", expected: 100, pattern: patterns.thai },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-M1-M3-TEACHER-STARTER-PACK.md", expected: 103, pattern: patterns.thai },
  { area: "Thai Language", path: "docs/learning/thai-language/THAI-LANGUAGE-M4-M6-SHARED-TEACHER-STARTER-PACK.md", expected: 36, pattern: patterns.thai },

  { area: "Mathematics", path: "docs/learning/maths/M1-mathematics-teacher-starter-pack.md", expected: 9, pattern: patterns.maths },
  { area: "Mathematics", path: "docs/learning/maths/M2-M3-mathematics-teacher-starter-pack.md", expected: 24, pattern: patterns.maths },
  { area: "Mathematics", path: "docs/learning/maths/M4-M6-mathematics-teacher-starter-pack.md", expected: 8, pattern: patterns.maths },

  { area: "Science and Technology", path: "docs/learning/science/P1-P3-science-w1-w3-teacher-starter-pack.md", expected: 42, pattern: patterns.science },
  { area: "Science and Technology", path: "docs/learning/science/P4-P6-science-w1-w3-teacher-starter-pack.md", expected: 69, pattern: patterns.science },
  { area: "Science and Technology", path: "docs/learning/science/SCIENCE-TECHNOLOGY-W4.2-P1-P6-TEACHER-STARTER-PACK.md", expected: 28, pattern: patterns.science },
  { area: "Science and Technology", path: "docs/learning/science/SCIENCE-M1-M3-COMPLETE-IMPORT.md", expected: 174, pattern: patterns.science },
  { area: "Science and Technology", path: "docs/learning/science/SCIENCE-M4-M6-COMPLETE-IMPORT.md", expected: 102, pattern: patterns.science },

  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-P1-P3-TEACHER-STARTER-PACK.md", expected: 104, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-P4-TEACHER-STARTER-PACK.md", expected: 38, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-P5-TEACHER-STARTER-PACK.md", expected: 36, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-P6-TEACHER-STARTER-PACK.md", expected: 39, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-M1-TEACHER-STARTER-PACK.md", expected: 45, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-M2-TEACHER-STARTER-PACK.md", expected: 45, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-M3-TEACHER-STARTER-PACK.md", expected: 50, pattern: patterns.social },
  { area: "Social Studies", path: "docs/learning/social-studies/SOCIAL-STUDIES-M4-M6-TEACHER-STARTER-PACK.md", expected: 61, pattern: patterns.social },

  { area: "Health and Physical Education", path: "docs/learning/health-pe/HEALTH-PE-P1-P3-TEACHER-STARTER-PACK.md", expected: 54, pattern: patterns.health },
  { area: "Health and Physical Education", path: "docs/learning/health-pe/HEALTH-PE-P4-P6-TEACHER-STARTER-PACK.md", expected: 66, pattern: patterns.health },
  { area: "Health and Physical Education", path: "docs/learning/health-pe/HEALTH-PE-M1-M3-TEACHER-STARTER-PACK.md", expected: 72, pattern: patterns.health },
  { area: "Health and Physical Education", path: "docs/learning/health-pe/HEALTH-PE-M4-M6-SHARED-TEACHER-STARTER-PACK.md", expected: 29, pattern: patterns.health },

  { area: "Arts", path: "docs/learning/arts/ARTS-P1-P3-TEACHER-STARTER-PACK.md", expected: 72, pattern: patterns.arts },
  { area: "Arts", path: "docs/learning/arts/ARTS-P4-TEACHER-STARTER-PACK.md", expected: 29, pattern: patterns.arts },
  { area: "Arts", path: "docs/learning/arts/ARTS-P5-TEACHER-STARTER-PACK.md", expected: 26, pattern: patterns.arts },
  { area: "Arts", path: "docs/learning/arts/ARTS-P6-TEACHER-STARTER-PACK.md", expected: 27, pattern: patterns.arts, mode: "codes" },
  { area: "Arts", path: "docs/learning/arts/ARTS-M1-TEACHER-STARTER-PACK.md", expected: 27, pattern: patterns.arts, mode: "codes" },
  { area: "Arts", path: "docs/learning/arts/ARTS-M2-TEACHER-STARTER-PACK.md", expected: 27, pattern: patterns.arts },
  { area: "Arts", path: "docs/learning/arts/ARTS-M3-TEACHER-STARTER-PACK.md", expected: 32, pattern: patterns.arts },
  { area: "Arts", path: "docs/learning/arts/ARTS-M4-M6-TEACHER-STARTER-PACK.md", expected: 39, pattern: patterns.arts },

  { area: "Occupations and Career", path: "docs/learning/career/CAREER-P1-P3-TEACHER-STARTER-PACK.md", expected: 9, pattern: patterns.career },
  { area: "Occupations and Career", path: "docs/learning/career/CAREER-P4-P5-TEACHER-STARTER-PACK.md", expected: 11, pattern: patterns.career },
  { area: "Occupations and Career", path: "docs/learning/career/CAREER-P6-M6-TEACHER-STARTER-PACK.md", expected: 34, pattern: patterns.career },

  { area: "Foreign Languages", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P1-P3-TEACHER-STARTER-PACK.md", expected: 50, pattern: patterns.foreign },
  { area: "Foreign Languages", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-P4-P6-TEACHER-STARTER-PACK.md", expected: 60, pattern: patterns.foreign },
  { area: "Foreign Languages", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M1-M3-TEACHER-STARTER-PACK.md", expected: 62, pattern: patterns.foreign },
  { area: "Foreign Languages", path: "docs/learning/foreign-languages/FOREIGN-LANGUAGES-M4-M6-SHARED-TEACHER-STARTER-PACK.md", expected: 21, pattern: patterns.foreign },
];

const expectedAreaTotals = {
  "Thai Language": 319,
  "Mathematics": 41,
  "Science and Technology": 415,
  "Social Studies": 418,
  "Health and Physical Education": 221,
  "Arts": 279,
  "Occupations and Career": 54,
  "Foreign Languages": 193,
};
const globalCodes = new Map();
const areaTotals = new Map();
const failures = [];
let totalLessons = 0;

for (const pack of packs) {
  const markdown = await readFile(resolve(root, pack.path), "utf8");
  const headings = [...markdown.matchAll(/^#{2,4}\s+(?:Lesson\s+)?0*(\d+)\s*(?:[.:\-—]|—)/gm)];
  const seenCodes = new Set();

  if (pack.mode === "codes") {
    const matches = markdown.match(new RegExp(pack.pattern.source, "g")) ?? [];
    for (const code of new Set(matches)) {
      seenCodes.add(code);
      const existing = globalCodes.get(code);
      if (existing) failures.push("Objective code " + code + " appears in both " + existing + " and " + pack.path);
      else globalCodes.set(code, pack.path);
    }
    if (seenCodes.size !== pack.expected) {
      failures.push(pack.path + ": expected " + pack.expected + " unique objective codes, found " + seenCodes.size);
    }
    process.stdout.write("Checked " + pack.path + ": " + seenCodes.size + " unique objective codes (indicator-list format).\n");
  } else {
    if (headings.length !== pack.expected) {
      failures.push(pack.path + ": expected " + pack.expected + " lesson headings, found " + headings.length);
    }

    for (let index = 0; index < headings.length; index += 1) {
      const number = Number(headings[index][1]);
      const sectionStart = headings[index].index;
      const sectionEnd = index + 1 < headings.length ? headings[index + 1].index : markdown.length;
      const section = markdown.slice(sectionStart, sectionEnd);
      const matches = section.match(new RegExp(pack.pattern.source, "g")) ?? [];
      const sectionCodes = [...new Set(matches)];

      if (sectionCodes.length !== 1) {
        failures.push(pack.path + ": lesson heading " + (index + 1) + " (number " + number + ") has " + sectionCodes.length + " internal objective codes; expected exactly one");
      }
      for (const code of sectionCodes) {
        if (seenCodes.has(code)) failures.push(pack.path + ": duplicate objective code " + code);
        seenCodes.add(code);
        const existing = globalCodes.get(code);
        if (existing) failures.push("Objective code " + code + " appears in both " + existing + " and " + pack.path);
        else globalCodes.set(code, pack.path);
      }
    }

    if (seenCodes.size !== pack.expected) {
      failures.push(pack.path + ": expected " + pack.expected + " unique objective codes, found " + seenCodes.size);
    }
    process.stdout.write("Checked " + pack.path + ": " + headings.length + " lessons, " + seenCodes.size + " unique objective codes.\n");
  }

  areaTotals.set(pack.area, (areaTotals.get(pack.area) ?? 0) + seenCodes.size);
  totalLessons += seenCodes.size;
  process.stdout.write("Checked " + pack.path + ": " + headings.length + " lessons, " + seenCodes.size + " unique objective codes.\n");
}

for (const [area, expected] of Object.entries(expectedAreaTotals)) {
  const actual = areaTotals.get(area) ?? 0;
  if (actual !== expected) failures.push(area + ": expected " + expected + " unique indicators across teacher packs, found " + actual);
  process.stdout.write(area + ": " + actual + "/" + expected + " unique indicators.\n");
}

if (failures.length) {
  process.stderr.write("\nNational curriculum teacher-pack validation failed (" + failures.length + " issue(s)):\n");
  for (const failure of failures) process.stderr.write("- " + failure + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nPASS: " + packs.length + " teacher packs cover " + totalLessons + " unique national curriculum indicators across all eight learning areas.\n");
}
