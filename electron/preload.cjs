const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nostalcore", {
  platform: process.platform,
  appVersion: "0.0.8",

  selectGame: () => {
    return ipcRenderer.invoke("games:select-file");
  },

  addGame: (game) => {
    return ipcRenderer.invoke("library:add-game", game);
  },

  listGames: () => {
    return ipcRenderer.invoke("library:list-games");
  },
  getEmulatorSettings: () => {
  return ipcRenderer.invoke("emulators:get-settings");
},

selectEmulator: (emulatorId) => {
  return ipcRenderer.invoke(
    "emulators:select-executable",
    emulatorId,
  );
},
launchGame: (gameId) => {
  return ipcRenderer.invoke("games:launch", gameId);
},
});