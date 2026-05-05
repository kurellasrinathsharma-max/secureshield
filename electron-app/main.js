const { app, BrowserWindow, Tray, Menu, shell, nativeImage, Notification } = require("electron");
const path = require("path");

// ── App URL ──────────────────────────────────────────────────────────────────
// This gets replaced at build time by the GitHub Actions workflow.
// To test locally: set SECURESHIELD_URL env var, or edit this line.
const APP_URL = process.env.SECURESHIELD_URL || "https://YOUR-APP.replit.app";

// ── State ────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let isQuiting = false;

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

  // Hide the default menu bar
  mainWindow.removeMenu();

  // Show animated splash screen first
  mainWindow.loadFile(path.join(__dirname, "splash.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Load the actual app after splash
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(APP_URL);
    }
  }, 2400);

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Retry on network failure
  let retryCount = 0;
  mainWindow.webContents.on("did-fail-load", (event, errorCode) => {
    if (errorCode === -3) return; // aborted (normal on navigation)
    if (retryCount < 3 && mainWindow && !mainWindow.isDestroyed()) {
      retryCount++;
      setTimeout(() => mainWindow.loadURL(APP_URL), 4000 * retryCount);
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    retryCount = 0;
  });

  // Minimize to tray on close
  mainWindow.on("close", (e) => {
    if (!isQuiting) {
      e.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported() && tray) {
        new Notification({
          title: "SecureShield",
          body: "Still running in the background and protecting your PC.",
          icon: iconPath,
        }).show();
      }
    }
  });
}

// ── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
  const trayIconPath = path.join(__dirname, "build", "tray.ico");
  const fallbackPath = path.join(__dirname, "build", "icon.ico");

  let trayIcon = nativeImage.createFromPath(trayIconPath);
  if (trayIcon.isEmpty()) trayIcon = nativeImage.createFromPath(fallbackPath);

  tray = new Tray(trayIcon);
  tray.setToolTip("SecureShield — Your PC is protected");

  const buildContextMenu = () =>
    Menu.buildFromTemplate([
      {
        label: "Open SecureShield",
        type: "normal",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        },
      },
      { type: "separator" },
      {
        label: "Run Smart Scan",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript(
            `window.history.pushState({}, "", "/scan"); window.dispatchEvent(new PopStateEvent("popstate"));`
          );
        },
      },
      {
        label: "Scam Guardian AI",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript(
            `window.history.pushState({}, "", "/scam-guardian"); window.dispatchEvent(new PopStateEvent("popstate"));`
          );
        },
      },
      {
        label: "Privacy Center",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript(
            `window.history.pushState({}, "", "/privacy"); window.dispatchEvent(new PopStateEvent("popstate"));`
          );
        },
      },
      { type: "separator" },
      {
        label: "Quit SecureShield",
        click: () => {
          isQuiting = true;
          app.quit();
        },
      },
    ]);

  tray.setContextMenu(buildContextMenu());
  tray.on("double-click", () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  // On Windows: keep running in tray; on macOS: quit
  if (process.platform === "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on("before-quit", () => {
  isQuiting = true;
});
