export type LibraryGame = {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  extension: string;
  consoleName: string;
  region?: string | null;
  languages?: string[];
  revision?: string | null;
  
  cover: string;
  banner: string;
  description: string;
  favorite: boolean;
  playTimeMinutes: number;
  playCount: number;
  lastPlayedAt: string | null;
  importedAt: string;

  releaseYear?: number | null;
developer?: string | null;
publisher?: string | null;
genres?: string[];
players?: number | null;
};