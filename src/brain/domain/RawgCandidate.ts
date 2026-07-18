export type RawgCandidate = {
  id: number;
  name: string;
  released: string | null;
  rating: number | null;
  backgroundImage: string | null;
  genres: string[];
  platforms: string[];
};

export type RankedRawgCandidate = RawgCandidate & {
  score: number;
  reasons: string[];
};