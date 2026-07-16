type ImportedGame = {
  title: string;
  fileName: string;
  filePath: string;
  extension: string;
  consoleName: string;
  
  region?: string | null;
  languages?: string[];
  revision?: string | null;

  releaseYear?: number | null;
developer?: string | null;
publisher?: string | null;
genres?: string[];
players?: number | null;
description?: string;
};

type LibraryGame = ImportedGame & {
  id: string;
  cover: string;
  banner: string;
  description: string;
  favorite: boolean;
  playTimeMinutes: number;
  playCount: number;
  lastPlayedAt: string | null;
  importedAt: string;
};

type SelectGameResult =
  | {
      canceled: true;
      game?: never;
    }
  | {
      canceled: false;
      game: ImportedGame;
    };

type AddGameResult =
  | {
      success: true;
      game: LibraryGame;
    }
  | {
      success: false;
      error: string;
    };

type ListGamesResult =
  | {
      success: true;
      games: LibraryGame[];
      error?: never;
    }
  | {
      success: false;
      games: LibraryGame[];
      error: string;
    };
type EmulatorConfiguration = {
  executablePath: string;
  configuredAt: string;
};

type EmulatorSettingsResult = {
  success: boolean;
  emulators: Record<string, EmulatorConfiguration>;
  error?: string;
};

type SelectEmulatorResult =
  | {
      canceled: true;
      success?: never;
      executablePath?: never;
      error?: never;
    }
  | {
      canceled: false;
      success: true;
      executablePath: string;
      error?: never;
    }
  | {
      canceled: false;
      success: false;
      executablePath?: never;
      error: string;
    };
type LaunchGameResult =
  | {
      success: true;
      error?: never;
    }
  | {
      success: false;
      error: string;
    };

declare global {
  interface Window {
    nostalcore: {
      platform: string;
      appVersion: string;

      selectGame: () => Promise<SelectGameResult>;

      addGame: (
        game: ImportedGame,
      ) => Promise<AddGameResult>;

      listGames: () => Promise<ListGamesResult>;
      getEmulatorSettings:
  () => Promise<EmulatorSettingsResult>;

selectEmulator: (
  emulatorId: string,
) => Promise<SelectEmulatorResult>;

launchGame: (
  gameId: string,
) => Promise<LaunchGameResult>;
    };
  }
}

export {};