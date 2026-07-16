export type BrainGame = {
  title: string;
  fileName: string;
  filePath: string;
  extension: string;
  consoleName: string;

  region: string | null;
  languages: string[];
  revision: string | null;

   releaseYear: number | null;
  developer: string | null;
  publisher: string | null;
  genres: string[];
  players: number | null;
  description: string;
};

export type BrainContext = {
  game: BrainGame;
  progress: number;
  currentTask: string;
  errors: string[];
};

