const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const isDevelopment = !app.isPackaged;
const { spawn } = require("node:child_process");

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

      cover: "",
      banner: "",
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

app.whenReady().then(() => {
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
  const libraryFilePath = getLibraryFilePath();

  await fs.mkdir(path.dirname(libraryFilePath), {
    recursive: true,
  });

  await fs.writeFile(
    libraryFilePath,
    JSON.stringify(games, null, 2),
    "utf8",
  );
}