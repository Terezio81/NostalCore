import type { LibraryGame } from "../../types/Game";
import type { LibraryStatistics } from "../../types/LibraryStatistics";

export class StatisticsService {
  static build(
    games: LibraryGame[],
  ): LibraryStatistics {
    const totalGames = games.length;

    const totalConsoles = new Set(
      games.map((game) =>
        game.consoleName.trim(),
      ),
    ).size;

    const totalFavorites =
      games.filter(
        (game) => game.favorite,
      ).length;

    const totalPlayTimeMinutes =
      games.reduce(
        (total, game) => {
          return (
            total +
            Math.max(
              0,
              game.playTimeMinutes ?? 0,
            )
          );
        },
        0,
      );

    const mostPlayedGame =
      [...games].sort((a, b) => {
        const aPlayTime =
          a.playTimeMinutes ?? 0;

        const bPlayTime =
          b.playTimeMinutes ?? 0;

        if (aPlayTime !== bPlayTime) {
          return bPlayTime - aPlayTime;
        }

        return (
          (b.playCount ?? 0) -
          (a.playCount ?? 0)
        );
      })[0] ?? null;

    const recentlyPlayedGame =
      [...games]
        .filter(
          (game) =>
            Boolean(game.lastPlayedAt),
        )
        .sort((a, b) => {
          const aDate = new Date(
            a.lastPlayedAt ?? 0,
          ).getTime();

          const bDate = new Date(
            b.lastPlayedAt ?? 0,
          ).getTime();

          return bDate - aDate;
        })[0] ?? null;

    const latestImportedGame =
      [...games].sort((a, b) => {
        const aDate = new Date(
          a.importedAt,
        ).getTime();

        const bDate = new Date(
          b.importedAt,
        ).getTime();

        return bDate - aDate;
      })[0] ?? null;

    return {
      totalGames,

      totalConsoles,

      totalFavorites,

      totalPlayTimeMinutes,

      mostPlayedGame,

      recentlyPlayedGame,

      latestImportedGame,
    };
  }
}