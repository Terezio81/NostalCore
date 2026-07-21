import type { LibraryGame } from "../../types/Game";

export interface Achievement {
  id: string;

  title: string;

  description: string;

  unlocked: boolean;

  progress: number;

  target: number;

  progressLabel: string;

  rarity:
    | "common"
    | "rare"
    | "epic"
    | "legendary";

    icon: AchievementIcon;

    hidden?: boolean;
}

export type AchievementIcon =
  | "boot"
  | "collection"
  | "explorer"
  | "marathon"
  | "veteran"
  | "loyalty";

export class AchievementService {
  static build(
    games: LibraryGame[],
  ): Achievement[] {
    const totalGames = games.length;

    const totalConsoles = new Set(
      games
        .map((game) => game.consoleName)
        .filter(Boolean),
    ).size;

    const totalPlayTimeMinutes =
      games.reduce((total, game) => {
        return (
          total +
          (game.playTimeMinutes ?? 0)
        );
      }, 0);

    const totalSessions =
      games.reduce((total, game) => {
        return (
          total +
          (game.playSessions?.length ?? 0)
        );
      }, 0);

    const mostPlayedGame =
      [...games].sort((a, b) => {
        return (
          (b.playCount ?? 0) -
          (a.playCount ?? 0)
        );
      })[0] ?? null;

    return [
      {
        id: "first-game",
        title: "Primeiro Boot",
        description:
          "Inicie seu primeiro jogo.",
        unlocked: totalSessions >= 1,
        progress: Math.min(
          totalSessions,
          1,
        ),
        target: 1,
        rarity: "common",
        icon: "boot",
        progressLabel:
  totalSessions >= 1
    ? "Primeiro jogo iniciado"
    : "Inicie seu primeiro jogo",
      },

      {
        id: "collector-10",
        title: "Colecionador",
        description:
          "Adicione 10 jogos à biblioteca.",
        unlocked: totalGames >= 10,
        progress: Math.min(
          totalGames,
          10,
        ),
        target: 10,
        rarity: "common",
        icon: "collection",
        progressLabel:
  `${Math.min(totalGames, 10)} de 10 jogos`,
             
      },

      {
        id: "explorer-5",
        title: "Explorador",
        description:
          "Tenha jogos de 5 consoles diferentes.",
        unlocked: totalConsoles >= 5,
        progress: Math.min(
          totalConsoles,
          5,
        ),
        target: 5,
        rarity: "rare",
        icon: "explorer",
        progressLabel:
        `${Math.min(totalConsoles, 5)} de 5 consoles`,
      },

      {
        id: "marathon-10-hours",
        title: "Maratonista",
        description:
          "Jogue por 10 horas no total.",
        unlocked:
          totalPlayTimeMinutes >= 600,
        progress: Math.min(
          totalPlayTimeMinutes,
          600,
        ),
        target: 600,
        rarity: "epic",
        icon: "marathon",
        progressLabel:
        `${Math.floor(
        Math.min(totalPlayTimeMinutes, 600) / 60,
        )}h jogadas de 10h`,
      },

      {
        id: "veteran-50-sessions",
        title: "Veterano",
        description:
          "Complete 50 sessões de jogo.",
        unlocked: totalSessions >= 50,
        progress: Math.min(
          totalSessions,
          50,
        ),
        target: 50,
        rarity: "epic",
        icon: "veteran",
        progressLabel:
        `${Math.min(totalSessions, 50)} de 50 sessões`,
      },

      {
        id: "loyal-player",
        title: "Fã de Carteirinha",
        description:
          "Abra o mesmo jogo 20 vezes.",
        unlocked:
          (mostPlayedGame?.playCount ?? 0) >=
          20,
        progress: Math.min(
          mostPlayedGame?.playCount ?? 0,
          20,
        ),
        target: 20,
        rarity: "legendary",
        icon: "loyalty",
        progressLabel:
        `${Math.min(
        mostPlayedGame?.playCount ?? 0,
        20,
        )} de 20 inicializações`,
      },
    ];
  }
}