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
      const consoleName =
        game.consoleName.trim();

      const currentGames =
        groups.get(consoleName) ?? [];

      currentGames.push(game);

      groups.set(
        consoleName,
        currentGames,
      );
    }

    const collections: ConsoleCollection[] =
      Array.from(groups.entries()).map(
        ([consoleName, consoleGames]) => {
          const favoriteGames =
            consoleGames.filter(
              (game) => game.favorite,
            ).length;

          const lastPlayedGame =
            [...consoleGames]
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
            [...consoleGames].sort(
              (a, b) => {
                const aDate = new Date(
                  a.importedAt,
                ).getTime();

                const bDate = new Date(
                  b.importedAt,
                ).getTime();

                return bDate - aDate;
              },
            )[0] ?? null;

          return {
            id: consoleName
              .toLowerCase()
              .normalize("NFD")
              .replace(
                /[\u0300-\u036f]/g,
                "",
              )
              .replace(
                /[^a-z0-9]+/g,
                "-",
              )
              .replace(
                /^-+|-+$/g,
                "",
              ),

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

    return collections.sort((a, b) => {
      const aLastPlayed =
        a.lastPlayedGame?.lastPlayedAt
          ? new Date(
              a.lastPlayedGame.lastPlayedAt,
            ).getTime()
          : 0;

      const bLastPlayed =
        b.lastPlayedGame?.lastPlayedAt
          ? new Date(
              b.lastPlayedGame.lastPlayedAt,
            ).getTime()
          : 0;

      if (aLastPlayed !== bLastPlayed) {
        return bLastPlayed - aLastPlayed;
      }

      if (
        a.totalGames !== b.totalGames
      ) {
        return (
          b.totalGames -
          a.totalGames
        );
      }

      return a.name.localeCompare(
        b.name,
        "pt-BR",
      );
    });
  }
}