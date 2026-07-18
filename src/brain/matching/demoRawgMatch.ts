import { rankRawgCandidates } from "./RawgMatchEngine";

const candidates = [
  {
    id: 53239,
    name: "Disney's Aladdin",
    released: "1993-11-11",
    rating: 3.8,
    backgroundImage: null,
    genres: ["Platform"],
    platforms: [
      "SNES",
      "Game Boy",
    ],
  },
  {
    id: 547607,
    name: "Aladdin",
    released: "2021-01-23",
    rating: 0,
    backgroundImage: null,
    genres: ["Platform"],
    platforms: [
      "PC",
      "Android",
    ],
  },
  {
    id: 495621,
    name: "Disney's Aladdin (1993)",
    released: "1993-11-21",
    rating: 3.9,
    backgroundImage: null,
    genres: ["Platform"],
    platforms: [
      "Genesis",
      "PC",
    ],
  },
];

const ranked = rankRawgCandidates(
  "Aladdin",
  "Super Nintendo",
  candidates,
);

console.table(
  ranked.map((candidate) => ({
    name: candidate.name,
    platforms: candidate.platforms.join(", "),
    score: candidate.score,
    reasons: candidate.reasons.join(", "),
  })),
);