import type { LibraryGame } from "./Game";

export interface LibraryStatistics {
  totalGames: number;

  totalConsoles: number;

  totalFavorites: number;

  totalPlayTimeMinutes: number;

  mostPlayedGame: LibraryGame | null;

  recentlyPlayedGame: LibraryGame | null;

  latestImportedGame: LibraryGame | null;
}