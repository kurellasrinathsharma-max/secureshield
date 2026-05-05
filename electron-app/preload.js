const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronShield", {
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke("app-version"),
  checkForUpdates: () => ipcRenderer.invoke("check-updates"),
});
