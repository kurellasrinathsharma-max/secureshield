const { contextBridge } = require("electron");

// Expose a minimal, safe API to the renderer
contextBridge.exposeInMainWorld("electronShield", {
  platform: process.platform,
  version: process.env.npm_package_version || "1.0.0",
});
