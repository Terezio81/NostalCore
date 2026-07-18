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
  deleteGames: (gameIds) => {
  return ipcRenderer.invoke(
    "library:delete-games",
    gameIds,
  );
},
toggleFavorite: (gameId) => {
  return ipcRenderer.invoke(
    "library:toggle-favorite",
    gameId,
  );
},

clearLibrary: () => {
  return ipcRenderer.invoke("library:clear");
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
checkRawgConfiguration: () => {
  return ipcRenderer.invoke(
    "rawg:check-configuration",
  );
},
searchRawgGame: (gameTitle) => {
  return ipcRenderer.invoke(
    "rawg:search-game",
    gameTitle,
  );
},
getRawgGameDetails: (gameId) => {
  return ipcRenderer.invoke(
    "rawg:get-game-details",
    gameId,
  );
},

cacheRemoteImage: (
  imageUrl,
  category,
) => {
  return ipcRenderer.invoke(
    "images:cache-remote",
    imageUrl,
    category,
  );
},

});