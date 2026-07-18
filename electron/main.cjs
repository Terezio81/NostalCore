const { app, BrowserWindow, dialog, ipcMain, protocol,net,} = require("electron");
const path = require("node:path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const isDevelopment = !app.isPackaged;
const { spawn } = require("node:child_process");

const { pathToFileURL, } = require("node:url");

function detectConsole(extension) {
  const consolesByExtension = {
    ".nes": "Nintendo Entertainment System",
    ".sfc": "Super Nintendo",
    ".smc": "Super Nintendo",
    ".n64": "Nintendo 64",
    ".z64": "Nintendo 64",
    ".v64": "Nintendo 64",
    ".gb": "Game Boy",
    ".gbc": "Game Boy Color",
    ".gba": "Game Boy Advance",
    ".gen": "Mega Drive",
    ".md": "Mega Drive",
    ".sms": "Master System",
    ".gg": "Game Gear",
    ".cue": "PlayStation",
    ".chd": "PlayStation ou Arcade",
    ".iso": "Imagem de disco",
  };

  return consolesByExtension[extension] ?? "Console não identificado";
}

function formatGameTitle(fileName) {
  const extension = path.extname(fileName);

  return path
    .basename(fileName, extension)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
ipcMain.handle("rawg:check-configuration", async () => {
  const apiKey = process.env.RAWG_API_KEY?.trim();

  return {
    configured: Boolean(apiKey),
  };
});

ipcMain.handle(
  "rawg:search-game",
  async (_event, gameTitle) => {
    try {
      const apiKey =
        process.env.RAWG_API_KEY?.trim();

      if (!apiKey) {
        return {
          success: false,
          games: [],
          error: "A chave da RAWG não está configurada.",
        };
      }

      if (
        typeof gameTitle !== "string" ||
        !gameTitle.trim()
      ) {
        return {
          success: false,
          games: [],
          error: "Informe o nome de um jogo.",
        };
      }

      const parameters = new URLSearchParams({
        key: apiKey,
        search: gameTitle.trim(),
        search_precise: "true",
        page_size: "5",
      });

      const response = await fetch(
        `https://api.rawg.io/api/games?${parameters.toString()}`,
      );
      console.log(
    "Status:",
    response.status,
);

console.log(
    "Content-Type:",
    response.headers.get("content-type"),
);

      if (!response.ok) {
        console.error(
          "Erro da RAWG:",
          response.status,
          response.statusText,
        );

        return {
          success: false,
          games: [],
          error: `A RAWG respondeu com o código ${response.status}.`,
        };
      }

      const data = await response.json();

      const games = (data.results ?? []).map(
        (game) => ({
          id: game.id,
          name: game.name,
          released: game.released ?? null,
          rating: game.rating ?? null,
          backgroundImage:
            game.background_image ?? null,

          genres: (game.genres ?? []).map(
            (genre) => genre.name,
          ),

          platforms: (
            game.platforms ?? []
          ).map(
            (item) => item.platform.name,
          ),
        }),
      );

      return {
        success: true,
        games,
      };
    } catch (error) {
      console.error(
        "Erro ao pesquisar na RAWG:",
        error,
      );

      return {
        success: false,
        games: [],
        error:
          "Não foi possível pesquisar o jogo na RAWG.",
      };
    }
  },
  
);

ipcMain.handle(
  "library:toggle-favorite",
  async (_event, gameId) => {
    try {
      if (
        typeof gameId !== "string" ||
        !gameId.trim()
      ) {
        return {
          success: false,
          game: null,
          error: "O jogo informado é inválido.",
        };
      }

      const games = await readLibrary();

      const gameIndex = games.findIndex(
        (game) => game.id === gameId,
      );

      if (gameIndex === -1) {
        return {
          success: false,
          game: null,
          error:
            "O jogo não foi encontrado na biblioteca.",
        };
      }

      const updatedGame = {
        ...games[gameIndex],
        favorite:
          !Boolean(games[gameIndex].favorite),
      };

      const updatedGames = [...games];

      updatedGames[gameIndex] =
        updatedGame;

      await writeLibrary(updatedGames);

      return {
        success: true,
        game: updatedGame,
      };
    } catch (error) {
      console.error(
        "Erro ao alterar favorito:",
        error,
      );

      return {
        success: false,
        game: null,
        error:
          "Não foi possível alterar o favorito.",
      };
    }
  },
);

ipcMain.handle(
  "images:cache-remote",
  async (
    _event,
    imageUrl,
    category = "covers",
  ) => {
    try {
      if (
        typeof imageUrl !== "string" ||
        !imageUrl.trim()
      ) {
        return {
          success: false,
          mediaUrl: "",
          fromCache: false,
          error:
            "O endereço da imagem é inválido.",
        };
      }

      const cachedImage =
        await cacheRemoteImage(
          imageUrl.trim(),
          category,
        );

      return {
        success: true,
        mediaUrl:
          cachedImage.mediaUrl,
        fromCache:
          cachedImage.fromCache,
      };
    } catch (error) {
      console.error(
        "Erro ao armazenar imagem:",
        error,
      );

      return {
        success: false,
        mediaUrl: "",
        fromCache: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a imagem.",
      };
    }
  },
);

ipcMain.handle(
  "rawg:get-game-details",
  async (_event, gameId) => {
    try {
      const apiKey =
        process.env.RAWG_API_KEY?.trim();

      if (!apiKey) {
        return {
          success: false,
          game: null,
          error: "A chave da RAWG não está configurada.",
        };
      }

      if (
        typeof gameId !== "number" ||
        !Number.isInteger(gameId)
      ) {
        return {
          success: false,
          game: null,
          error: "O ID informado é inválido.",
        };
      }

      const parameters = new URLSearchParams({
        key: apiKey,
      });

      const response = await fetch(
        `https://api.rawg.io/api/games/${gameId}?${parameters.toString()}`,
      );

      if (!response.ok) {
        console.error(
          "Erro da RAWG ao buscar detalhes:",
          response.status,
          response.statusText,
        );

        return {
          success: false,
          game: null,
          error:
            `A RAWG respondeu com o código ${response.status}.`,
        };
      }

      const data = await response.json();

      const game = {
        id: data.id,
        name: data.name,
        released: data.released ?? null,
        rating: data.rating ?? null,

        description:
          data.description_raw ??
          data.description ??
          "",

        backgroundImage:
          data.background_image ?? null,

        additionalImage:
          data.background_image_additional ?? null,

        genres: (data.genres ?? []).map(
          (genre) => genre.name,
        ),

        developers: (data.developers ?? []).map(
          (developer) => developer.name,
        ),

        publishers: (data.publishers ?? []).map(
          (publisher) => publisher.name,
        ),

        platforms: (data.platforms ?? []).map(
          (item) => item.platform.name,
        ),
      };

      return {
        success: true,
        game,
      };
    } catch (error) {
      console.error(
        "Erro ao buscar detalhes na RAWG:",
        error,
      );

      return {
        success: false,
        game: null,
        error:
          "Não foi possível obter os detalhes do jogo.",
      };
    }
  },
);

ipcMain.handle("games:select-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Importar jogo para o NostalCore",

    properties: ["openFile"],

    filters: [
      {
        name: "Jogos compatíveis",
        extensions: [
          "nes",
          "sfc",
          "smc",
          "n64",
          "z64",
          "v64",
          "gb",
          "gbc",
          "gba",
          "gen",
          "md",
          "sms",
          "gg",
          "cue",
          "chd",
          "iso",
        ],
      },
      {
        name: "Todos os arquivos",
        extensions: ["*"],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return {
      canceled: true,
    };
  }

  const filePath = result.filePaths[0];
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath).toLowerCase();

  return {
    canceled: false,

    game: {
      title: formatGameTitle(fileName),
      fileName,
      filePath,
      extension,
      consoleName: detectConsole(extension),
    },
  };
});

ipcMain.handle("library:list-games", async () => {
  try {
    const games = await readLibrary();

    return {
      success: true,
      games,
    };
  } catch {
    return {
      success: false,
      games: [],
      error: "Não foi possível carregar a biblioteca.",
    };
  }
});

ipcMain.handle(
  "library:delete-games",
  async (_event, gameIds) => {
    try {
      if (!Array.isArray(gameIds)) {
        return {
          success: false,
          deletedCount: 0,
          error: "A lista de jogos é inválida.",
        };
      }

      const validIds = gameIds.filter(
        (gameId) => typeof gameId === "string",
      );

      if (validIds.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          error: "Nenhum jogo foi selecionado.",
        };
      }

      const games = await readLibrary();
      const idsToDelete = new Set(validIds);

      const updatedGames = games.filter(
        (game) => !idsToDelete.has(game.id),
      );

      const deletedCount =
        games.length - updatedGames.length;

      await writeLibrary(updatedGames);

      return {
        success: true,
        deletedCount,
      };
    } catch (error) {
      console.error(
        "Erro ao excluir jogos da biblioteca:",
        error,
      );

      return {
        success: false,
        deletedCount: 0,
        error:
          "Não foi possível excluir os jogos selecionados.",
      };
    }
  },
);

ipcMain.handle("library:clear", async () => {
  try {
    const games = await readLibrary();
    const deletedCount = games.length;

    await writeLibrary([]);

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error(
      "Erro ao limpar biblioteca:",
      error,
    );

    return {
      success: false,
      deletedCount: 0,
      error: "Não foi possível limpar a biblioteca.",
    };
  }
});

ipcMain.handle("emulators:get-settings", async () => {
  try {
    const settings = await readSettings();

    return {
      success: true,
      emulators: settings.emulators,
    };
  } catch {
    return {
      success: false,
      emulators: {},
      error: "Não foi possível carregar os emuladores.",
    };
  }
});

ipcMain.handle(
  "emulators:select-executable",
  async (_event, emulatorId) => {
    const result = await dialog.showOpenDialog({
      title: "Selecione o executável do emulador",

      properties: ["openFile"],

      filters: [
        {
          name: "Aplicativos do Windows",
          extensions: ["exe"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return {
        canceled: true,
      };
    }

    const executablePath = result.filePaths[0];

    try {
      const settings = await readSettings();

      settings.emulators[emulatorId] = {
        executablePath,
        configuredAt: new Date().toISOString(),
      };

      await writeSettings(settings);

      return {
        canceled: false,
        success: true,
        executablePath,
      };
    } catch (error) {
      console.error("Erro ao salvar emulador:", error);

      return {
        canceled: false,
        success: false,
        error: "Não foi possível salvar o emulador.",
      };
    }
  },
);

ipcMain.handle("library:add-game", async (_event, importedGame) => {
  try {
    const games = await readLibrary();

    const duplicateGame = games.find(
      (game) => game.filePath === importedGame.filePath,
    );

    if (duplicateGame) {
      return {
        success: false,
        error: "Este jogo já está na sua biblioteca.",
      };
    }

    const newGame = {
      id: crypto.randomUUID(),
      title: importedGame.title,
      fileName: importedGame.fileName,
      filePath: importedGame.filePath,
      extension: importedGame.extension,
      consoleName: importedGame.consoleName,
      region: importedGame.region ?? null,
      languages: importedGame.languages ?? [],
      revision: importedGame.revision ?? null,

      releaseYear: importedGame.releaseYear ?? null,
      developer: importedGame.developer ?? null,
      publisher: importedGame.publisher ?? null,
      genres: importedGame.genres ?? [],
      players: importedGame.players ?? null,
      description: importedGame.description ?? "",

      cover: importedGame.cover ?? "",
      banner: importedGame.banner ?? "",
      description: importedGame.description ?? "",

      favorite: false,
      playTimeMinutes: 0,
      playCount: 0,
      lastPlayedAt: null,
      importedAt: new Date().toISOString(),
    };

    const updatedLibrary = [newGame, ...games];

    await writeLibrary(updatedLibrary);

    return {
      success: true,
      game: newGame,
    };
  } catch (error) {
    console.error("Erro ao adicionar jogo:", error);

    return {
      success: false,
      error: "Não foi possível salvar o jogo.",
    };
  }
});
ipcMain.handle("games:launch", async (_event, gameId) => {
  try {
    const games = await readLibrary();

    const game = games.find(
      (libraryGame) => libraryGame.id === gameId,
    );

    if (!game) {
      return {
        success: false,
        error: "Jogo não encontrado na biblioteca.",
      };
    }

    if (game.consoleName !== "Super Nintendo") {
      return {
        success: false,
        error:
          "Por enquanto, apenas jogos de Super Nintendo podem ser executados.",
      };
    }

    const settings = await readSettings();
    const emulator = settings.emulators.snes9x;

    if (!emulator?.executablePath) {
      return {
        success: false,
        error:
          "Configure o Snes9x antes de iniciar este jogo.",
      };
    }

    try {
      await fs.access(emulator.executablePath);
    } catch {
      return {
        success: false,
        error:
          "O executável configurado do Snes9x não foi encontrado.",
      };
    }

    try {
      await fs.access(game.filePath);
    } catch {
      return {
        success: false,
        error:
          "O arquivo do jogo não foi encontrado no caminho salvo.",
      };
    }

    const emulatorProcess = spawn(
      emulator.executablePath,
      [game.filePath],
      {
        detached: true,
        stdio: "ignore",
      },
    );

    emulatorProcess.unref();

game.lastPlayedAt = new Date().toISOString();
game.playCount = (game.playCount ?? 0) + 1;

await writeLibrary(games);

return {
  success: true,
};
  } catch (error) {
    console.error("Erro ao iniciar jogo:", error);

    return {
      success: false,
      error: "Não foi possível iniciar o jogo.",
    };
  }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1050,
    minHeight: 700,

    backgroundColor: "#121212",
    title: "NostalCore",
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (isDevelopment) {
      mainWindow.maximize();
    }
  });

  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "..", "dist", "index.html"),
    );
  }
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: "nostalcore-media",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);
app.whenReady().then(() => {
  protocol.handle(
    "nostalcore-media",
    async (request) => {
      try {
        const requestUrl =
          new URL(request.url);

        const pathParts = [
  requestUrl.hostname,
  requestUrl.pathname,
]
  .filter(Boolean)
  .join("/");

const relativePath = decodeURIComponent(
  pathParts,
).replace(/^\/+/, "");

        const mediaRoot = path.resolve(
          getMediaDirectory(),
        );

        const requestedPath = path.resolve(
          mediaRoot,
          relativePath,
        );

        console.log(
  "[NostalCore] Pasta de mídia:",
  mediaRoot,
);

console.log(
  "[NostalCore] Arquivo solicitado:",
  requestedPath,
);

        const isInsideMediaDirectory =
          requestedPath === mediaRoot ||
          requestedPath.startsWith(
            `${mediaRoot}${path.sep}`,
          );

        if (!isInsideMediaDirectory) {
          return new Response(
            "Acesso negado.",
            { status: 403 },
          );
        }
          try {
  await fs.access(requestedPath);

  console.log(
    "[NostalCore] Arquivo encontrado:",
    requestedPath,
  );
} catch {
  console.error(
    "[NostalCore] Arquivo NÃO encontrado:",
    requestedPath,
  );

  return new Response(
    "Arquivo não encontrado.",
    {
      status: 404,
    },
  );
}
        return net.fetch(
          pathToFileURL(
            requestedPath,
          ).toString(),
        );
      } catch (error) {
        console.error(
          "Erro ao carregar mídia local:",
          error,
        );

        return new Response(
          "Imagem não encontrada.",
          { status: 404 },
        );
      }
    },
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function getLibraryFilePath() {
  return path.join(app.getPath("userData"), "library.json");
}
function getSettingsFilePath() {
  return path.join(app.getPath("userData"), "settings.json");
}

async function readSettings() {
  try {
    const content = await fs.readFile(
      getSettingsFilePath(),
      "utf8",
    );

    const settings = JSON.parse(content);

    return {
      emulators: settings.emulators ?? {},
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        emulators: {},
      };
    }

    console.error("Erro ao ler configurações:", error);
    throw error;
  }
}

async function writeSettings(settings) {
  const settingsFilePath = getSettingsFilePath();

  await fs.mkdir(path.dirname(settingsFilePath), {
    recursive: true,
  });

  await fs.writeFile(
    settingsFilePath,
    JSON.stringify(settings, null, 2),
    "utf8",
  );
}

async function readLibrary() {
  const libraryFilePath = getLibraryFilePath();

  try {
    const fileContent = await fs.readFile(libraryFilePath, "utf8");
    const parsedLibrary = JSON.parse(fileContent);

    return Array.isArray(parsedLibrary) ? parsedLibrary : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    console.error("Erro ao ler a biblioteca:", error);
    throw error;
  }
}

async function writeLibrary(games) {
  const libraryFilePath =
    getLibraryFilePath();

  await fs.mkdir(
    path.dirname(libraryFilePath),
    {
      recursive: true,
    },
  );

  await fs.writeFile(
    libraryFilePath,
    JSON.stringify(games, null, 2),
    "utf8",
  );
}

function getMediaDirectory() {
  return path.join(
    app.getPath("userData"),
    "media",
  );
}

function getImageExtension(contentType) {
  const extensionsByType = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return extensionsByType[contentType] ?? ".jpg";
}

function createMediaUrl(
  category,
  fileName,
) {
  return (
    "nostalcore-media:///" +
    `${category}/${fileName}`
  );
}

async function cacheRemoteImage(
  imageUrl,
  category,
) {
  const parsedUrl = new URL(imageUrl);

  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      "A imagem precisa utilizar HTTPS.",
    );
  }

  const safeCategories = new Set([
    "covers",
    "banners",
    "screenshots",
  ]);

  if (!safeCategories.has(category)) {
    throw new Error(
      "A categoria da imagem é inválida.",
    );
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Falha ao baixar imagem: ${response.status}`,
    );
  }

  const contentType = (
    response.headers.get("content-type") ?? ""
  )
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (!contentType.startsWith("image/")) {
    throw new Error(
      "O endereço não retornou uma imagem.",
    );
  }

  const extension =
    getImageExtension(contentType);

  const fileHash = crypto
    .createHash("sha256")
    .update(imageUrl)
    .digest("hex")
    .slice(0, 32);

  const fileName =
    `${fileHash}${extension}`;

  const destinationDirectory = path.join(
    getMediaDirectory(),
    category,
  );

  const destinationPath = path.join(
    destinationDirectory,
    fileName,
  );
  console.log(
  "[NostalCore] Imagem será salva em:",
  destinationPath,
);

    await fs.mkdir(destinationDirectory, {
    recursive: true,
  });

  try {
    await fs.access(destinationPath);

    console.log(
      "[NostalCore] Imagem encontrada no cache:",
      destinationPath,
    );

    return {
      fileName,
      filePath: destinationPath,
      mediaUrl: createMediaUrl(
        category,
        fileName,
      ),
      fromCache: true,
    };
  } catch {
    console.log(
      "[NostalCore] Imagem será salva em:",
      destinationPath,
    );
  }
console.log("Baixando imagem...");
  const arrayBuffer =
    await response.arrayBuffer();
console.log(
    "Imagem baixada:",
    arrayBuffer.byteLength,
);
  const maximumSize =
    15 * 1024 * 1024;

  if (arrayBuffer.byteLength > maximumSize) {
    throw new Error(
      "A imagem ultrapassa o limite de 15 MB.",
    );
  }

  await fs.writeFile(
    destinationPath,
    Buffer.from(arrayBuffer),
  );

  console.log(
    "[NostalCore] Imagem salva com sucesso:",
    destinationPath,
  );

  return {
    fileName,
    filePath: destinationPath,
    mediaUrl: createMediaUrl(
      category,
      fileName,
    ),
    fromCache: false,
  };
}
