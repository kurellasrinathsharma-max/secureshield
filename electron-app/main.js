const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  nativeImage,
  Notification,
  dialog,
  ipcMain,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const log = require("electron-log");

// ── Logging ───────────────────────────────────────────────────────────────────
log.transports.file.level = "info";
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// ── App URL ──────────────────────────────────────────────────────────────────
const APP_URL = process.env.SECURESHIELD_URL || "https://YOUR-APP.replit.app";

// ── State ────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let isQuiting = false;
let updateAvailable = false;

// ── Single instance lock ─────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── Create main window ───────────────────────────────────────────────────────
function createWindow() {
  const iconPath = path.join(__dirname, "build", "icon.ico");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 960,
    minHeight: 620,
    title: "SecureShield Antivirus Suite",
    icon: iconPath,
    backgroundColor: "#0a0a0f",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, "splash.html"));

  mainWindow.once("ready-to-show", () => mainWindow.show());

  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(APP_URL);
    }
  }, 2400);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  let retryCount = 0;
  mainWindow.webContents.on("did-fail-load", (_, errorCode) => {
    if (errorCode === -3) return;
    if (retryCount < 3 && mainWindow && !mainWindow.isDestroyed()) {
      retryCount++;
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(APP_URL);
      }, 4000 * retryCount);
    }
  });

  mainWindow.webContents.on("did-finish-load", () => { retryCount = 0; });

  mainWindow.on("close", (e) => {
    if (!isQuiting) {
      e.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: "SecureShield",
          body: "Still running in the background and protecting your PC.",
          icon: path.join(__dirname, "build", "icon.ico"),
        }).show();
      }
    }
  });
}

// ── System Tray ──────────────────────────────────────────────────────────────
function buildTrayMenu() {
  const updateItem = updateAvailable
    ? [
        {
          label: "⬆ Update Available — Install Now",
          click: () => {
            autoUpdater.quitAndInstall(true, true);
          },
        },
        { type: "separator" },
      ]
    : [];

  return Menu.buildFromTemplate([
    ...updateItem,
    {
      label: "Open SecureShield",
      click: () => { mainWindow.show(); mainWindow.focus(); },
    },
    { type: "separator" },
    {
      label: "Run Smart Scan",
      click: () => navigate("/scan"),
    },
    {
      label: "Scam Guardian AI",
      click: () => navigate("/scam-guardian"),
    },
    {
      label: "Privacy Center",
      click: () => navigate("/privacy"),
    },
    { type: "separator" },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    {
      label: "Check for Updates",
      click: () => {
        autoUpdater.checkForUpdates();
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "Checking for Updates",
            message: "SecureShield is checking for updates...\n\nYou will be notified if a new version is available.",
            buttons: ["OK"],
          });
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit SecureShield",
      click: () => { isQuiting = true; app.quit(); },
    },
  ]);
}

function navigate(route) {
  if (!mainWindow) return;
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.executeJavaScript(
    `window.history.pushState({}, "", "${route}"); window.dispatchEvent(new PopStateEvent("popstate"));`
  );
}

function createTray() {
  const trayIconPath = path.join(__dirname, "build", "tray.ico");
  const fallbackPath = path.join(__dirname, "build", "icon.ico");
  let trayIcon = nativeImage.createFromPath(trayIconPath);
  if (trayIcon.isEmpty()) trayIcon = nativeImage.createFromPath(fallbackPath);

  tray = new Tray(trayIcon);
  tray.setToolTip("SecureShield — Your PC is protected");
  tray.setContextMenu(buildTrayMenu());
  tray.on("double-click", () => { mainWindow.show(); mainWindow.focus(); });
}

function refreshTrayMenu() {
  if (tray) tray.setContextMenu(buildTrayMenu());
}

// ── Auto Updater ─────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  // Don't auto-download — ask user first
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates 10 seconds after launch, then every 4 hours
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 10_000);
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 4 * 60 * 60 * 1000);

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    if (!mainWindow) return;

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "SecureShield Update Available",
        message: `Version ${info.version} is available!`,
        detail: `You are running v${app.getVersion()}.\n\nThe new version will download in the background and install when you next quit SecureShield.`,
        buttons: ["Download Update", "Later"],
        defaultId: 0,
        cancelId: 1,
        icon: path.join(__dirname, "build", "icon.ico"),
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
          if (Notification.isSupported()) {
            new Notification({
              title: "SecureShield — Downloading Update",
              body: `Downloading v${info.version} in the background...`,
            }).show();
          }
        }
      });
  });

  autoUpdater.on("update-not-available", () => {
    log.info("No updates available.");
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.floor(progress.percent);
    if (mainWindow) mainWindow.setProgressBar(percent / 100);
    log.info(`Download progress: ${percent}%`);
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateAvailable = true;
    refreshTrayMenu();

    if (mainWindow) mainWindow.setProgressBar(-1); // remove progress bar

    log.info("Update downloaded:", info.version);

    if (!mainWindow) return;
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready to Install",
        message: `SecureShield ${info.version} is ready!`,
        detail: "Restart SecureShield now to apply the update, or it will install automatically next time you quit.",
        buttons: ["Restart & Update", "Update on Next Quit"],
        defaultId: 0,
        cancelId: 1,
        icon: path.join(__dirname, "build", "icon.ico"),
      })
      .then(({ response }) => {
        if (response === 0) {
          isQuiting = true;
          autoUpdater.quitAndInstall(true, true);
        }
      });
  });

  autoUpdater.on("error", (err) => {
    log.error("Auto-updater error:", err);
  });
}

// ── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.handle("app-version", () => app.getVersion());
ipcMain.handle("check-updates", () => autoUpdater.checkForUpdates());

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
});

app.on("before-quit", () => {
  isQuiting = true;
});
