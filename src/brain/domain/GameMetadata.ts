export type GameMetadata = {
  title: string;
  consoleName: string;
  releaseYear: number | null;
  developer: string | null;
  publisher: string | null;
  genres: string[];
  players: number | null;
  description: string;

  cover: string;
  banner: string;
};