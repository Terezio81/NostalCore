import type { LibraryGame } from "../../types/Game";

export class RecommendationService {
  static getMostPlayed(
  games: LibraryGame[],
): LibraryGame | null {
  const playedGames = games.filter(
    (game) =>
      (game.playTimeMinutes ?? 0) > 0,
  );

  if (playedGames.length === 0) {
    return null;
  }

  return [...playedGames].sort(
    (a, b) => {
      const playTimeDifference =
        (b.playTimeMinutes ?? 0) -
        (a.playTimeMinutes ?? 0);

      if (playTimeDifference !== 0) {
        return playTimeDifference;
      }

      return (
        (b.playCount ?? 0) -
        (a.playCount ?? 0)
      );
    },
  )[0];
}

  static getLastPlayed(games: LibraryGame[]) {
    return [...games]
      .filter(game => game.lastPlayedAt)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt!).getTime() -
          new Date(a.lastPlayedAt!).getTime()
      )[0];
  }

  static getFavoriteConsole(games: LibraryGame[]) {
    const consoles = new Map<string, number>();

    for (const game of games) {
      const consoleName = game.consoleName;

      consoles.set(
        consoleName,
        (consoles.get(consoleName) ?? 0) + 1
      );
    }

    let winner = "";
    let total = 0;

    for (const [consoleName, amount] of consoles) {
      if (amount > total) {
        winner = consoleName;
        total = amount;
      }
    }

    return {
      consoleName: winner,
      total
    };
  }
}