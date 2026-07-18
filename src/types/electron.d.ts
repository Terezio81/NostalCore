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

cover?: string;
banner?: string;

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

    type RawgConfigurationResult = {
  configured: boolean;
};

type RawgSearchGame = {
  id: number;
  name: string;
  released: string | null;
  rating: number | null;
  backgroundImage: string | null;
  genres: string[];
  platforms: string[];
};

type RawgSearchResult =
  | {
      success: true;
      games: RawgSearchGame[];
      error?: never;
    }
  | {
      success: false;
      games: RawgSearchGame[];
      error: string;
    };

    type RawgGameDetails = {
  id: number;
  name: string;
  released: string | null;
  rating: number | null;
  description: string;
  backgroundImage: string | null;
  additionalImage: string | null;
  genres: string[];
  developers: string[];
  publishers: string[];
  platforms: string[];
};

type RawgGameDetailsResult =
  | {
      success: true;
      game: RawgGameDetails;
      error?: never;
    }
  | {
      success: false;
      game: null;
      error: string;
    };
    type DeleteGamesResult =
  | {
      success: true;
      deletedCount: number;
      error?: never;
    }
  | {
      success: false;
      deletedCount: number;
      error: string;
    };

type ClearLibraryResult =
  | {
      success: true;
      deletedCount: number;
      error?: never;
    }
  | {
      success: false;
      deletedCount: number;
      error: string;
    };

    type CacheImageCategory =
  | "covers"
  | "banners"
  | "screenshots";

type CacheRemoteImageResult =
  | {
      success: true;
      mediaUrl: string;
      fromCache: boolean;
      error?: never;
    }
  | {
      success: false;
      mediaUrl: string;
      fromCache: boolean;
      error: string;
    };

    type ToggleFavoriteResult =
  | {
      success: true;
      game: LibraryGame;
      error?: never;
    }
  | {
      success: false;
      game: null;
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
  deleteGames: (
  gameIds: string[],
) => Promise<DeleteGamesResult>;

clearLibrary:
  () => Promise<ClearLibraryResult>;

selectEmulator: (
  emulatorId: string,
) => Promise<SelectEmulatorResult>;

launchGame: (
  gameId: string,
) => Promise<LaunchGameResult>;

checkRawgConfiguration:
  () => Promise<RawgConfigurationResult>;

  searchRawgGame: (
  gameTitle: string,
) => Promise<RawgSearchResult>;

getRawgGameDetails: (
  gameId: number,
) => Promise<RawgGameDetailsResult>;

cacheRemoteImage: (
  imageUrl: string,
  category: CacheImageCategory,
) => Promise<CacheRemoteImageResult>;

toggleFavorite: (
  gameId: string,
) => Promise<ToggleFavoriteResult>;


    };
    
  }
}

export {};