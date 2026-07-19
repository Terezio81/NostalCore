import type {
  GamePlaySession,
  LibraryGame,
} from "../../types/Game";

export interface GameSessionStatistics {
  totalSessions: number;

  totalMinutes: number;

  averageMinutes: number;

  longestSession: GamePlaySession | null;

  latestSession: GamePlaySession | null;
}

export class SessionStatisticsService {
  static build(
    game: LibraryGame,
  ): GameSessionStatistics {
    const sessions =
      game.playSessions ?? [];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes:
          game.playTimeMinutes ?? 0,
        averageMinutes: 0,
        longestSession: null,
        latestSession: null,
      };
    }

    const totalMinutes = sessions.reduce(
      (total, session) => {
        return (
          total +
          Math.max(
            0,
            session.durationMinutes,
          )
        );
      },
      0,
    );

    const averageMinutes = Math.round(
      totalMinutes / sessions.length,
    );

    const longestSession =
      [...sessions].sort((a, b) => {
        return (
          b.durationMinutes -
          a.durationMinutes
        );
      })[0] ?? null;

    const latestSession =
      [...sessions].sort((a, b) => {
        return (
          new Date(
            b.endedAt,
          ).getTime() -
          new Date(
            a.endedAt,
          ).getTime()
        );
      })[0] ?? null;

    return {
      totalSessions: sessions.length,

      totalMinutes,

      averageMinutes,

      longestSession,

      latestSession,
    };
  }
}