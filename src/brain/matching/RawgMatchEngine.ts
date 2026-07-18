import type {
  RankedRawgCandidate,
  RawgCandidate,
} from "../domain/RawgCandidate";

const CONSOLE_PLATFORM_NAMES: Record<string, string[]> = {
  "Super Nintendo": [
    "snes",
    "super nintendo",
    "super nintendo entertainment system",
  ],

  "Nintendo Entertainment System": [
    "nes",
    "nintendo entertainment system",
  ],

  "Nintendo 64": [
    "nintendo 64",
    "n64",
  ],

  "Game Boy": [
    "game boy",
  ],

  "Game Boy Color": [
    "game boy color",
  ],

  "Game Boy Advance": [
    "game boy advance",
  ],

  PlayStation: [
    "playstation",
    "playstation 1",
  ],

  "Mega Drive": [
    "genesis",
    "sega genesis",
    "mega drive",
  ],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function calculateTitleScore(
  expectedTitle: string,
  candidateTitle: string,
): number {
  const expected = normalizeText(expectedTitle);
  const candidate = normalizeText(candidateTitle);

  if (candidate === expected) {
    return 60;
  }

  if (
    candidate.includes(expected) ||
    expected.includes(candidate)
  ) {
    return 45;
  }

  const expectedWords = expectedTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const candidateText = candidateTitle.toLowerCase();

  const matchingWords = expectedWords.filter((word) =>
    candidateText.includes(word),
  );

  if (expectedWords.length === 0) {
    return 0;
  }

  return Math.round(
    (matchingWords.length / expectedWords.length) * 35,
  );
}

export function hasCompatiblePlatform(
  consoleName: string,
  platforms: string[],
): boolean {
  const expectedPlatforms =
    CONSOLE_PLATFORM_NAMES[consoleName] ?? [
      consoleName.toLowerCase(),
    ];

  return platforms.some((platform) => {
    const normalizedPlatform = platform.toLowerCase();

    return expectedPlatforms.some((expected) =>
      normalizedPlatform.includes(expected),
    );
  });
}

function getReleaseYear(
  released: string | null,
): number | null {
  if (!released) {
    return null;
  }

  const year = Number(released.slice(0, 4));

  return Number.isFinite(year) ? year : null;
}

export function rankRawgCandidates(
  title: string,
  consoleName: string,
  candidates: RawgCandidate[],
): RankedRawgCandidate[] {
  return candidates
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      const titleScore = calculateTitleScore(
        title,
        candidate.name,
      );

      score += titleScore;

      if (titleScore === 60) {
        reasons.push("Título exato");
      } else if (titleScore >= 45) {
        reasons.push("Título muito semelhante");
      } else if (titleScore > 0) {
        reasons.push("Título parcialmente semelhante");
      }

      if (
        hasCompatiblePlatform(
          consoleName,
          candidate.platforms,
        )
      ) {
        score += 35;
        reasons.push("Plataforma compatível");
      }

      const releaseYear = getReleaseYear(
        candidate.released,
      );

      if (
        releaseYear !== null &&
        releaseYear <= 2005
      ) {
        score += 5;
        reasons.push("Lançamento retrô");
      }

      return {
        ...candidate,
        score,
        reasons,
      };
    })
    .sort((first, second) => second.score - first.score);
}