import type { LibraryGame } from "./Game";

export interface ConsoleCollection {
  id: string;

  name: string;

  games: LibraryGame[];

  totalGames: number;

  favoriteGames: number;

  lastPlayedGame: LibraryGame | null;

  latestImportedGame: LibraryGame | null;

  banner: string | null;

  cover: string | null;
}