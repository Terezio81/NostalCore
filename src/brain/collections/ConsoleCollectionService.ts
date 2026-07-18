import type { LibraryGame } from "../../types/Game";
import type { ConsoleCollection } from "../../types/ConsoleCollection";

export class ConsoleCollectionService {
  static build(
    games: LibraryGame[],
  ): ConsoleCollection[] {
    const groups = new Map<
      string,
      LibraryGame[]
    >();

    for (const game of games) {
      const key = game.consoleName;

      const current =
        groups.get(key) ?? [];

      current.push(game);

      groups.set(key, current);
    }

    return Array.from(groups.entries()).map(
      ([consoleName, consoleGames]) => {
        const favoriteGames =
          consoleGames.filter(
            (game) => game.favorite,
          ).length;

        const lastPlayedGame =
          [...consoleGames]
            .filter(
              (game) => game.lastPlayedAt,
            )
            .sort((a, b) => {
              return (
                new Date(
                  b.lastPlayedAt ?? 0,
                ).getTime() -
                new Date(
                  a.lastPlayedAt ?? 0,
                ).getTime()
              );
            })[0] ?? null;

        const latestImportedGame =
          [...consoleGames]
            .sort((a, b) => {
              return (
                new Date(
                  b.importedAt,
                ).getTime() -
                new Date(
                  a.importedAt,
                ).getTime()
              );
            })[0] ?? null;

        return {
          id: consoleName
            .toLowerCase()
            .replace(/\s+/g, "-"),

          name: consoleName,

          games: consoleGames,

          totalGames:
            consoleGames.length,

          favoriteGames,

          lastPlayedGame,

          latestImportedGame,

          banner:
            lastPlayedGame?.banner ??
            latestImportedGame?.banner ??
            null,

          cover:
            lastPlayedGame?.cover ??
            latestImportedGame?.cover ??
            null,
        };
      },
    );
  }
}