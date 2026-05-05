import fs from "fs";
import path from "path";

export type UserSettings = {
  displayName: string;
  emailAlertsEnabled: boolean;
  criticalThreatAlerts: boolean;
  threatFeedEnabled: boolean;
  updatedAt: string;
};

type UserStore = Record<string, UserSettings>;

const STORE_PATH = path.join(process.cwd(), "data", "user-settings.json");

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadStore(): UserStore {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as UserStore;
  } catch {
    return {};
  }
}

function saveStore(store: UserStore) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function defaultSettings(displayName: string): UserSettings {
  return {
    displayName,
    emailAlertsEnabled: false,
    criticalThreatAlerts: true,
    threatFeedEnabled: true,
    updatedAt: new Date().toISOString(),
  };
}

export function getSettings(email: string, displayName: string): UserSettings {
  const store = loadStore();
  if (!store[email]) {
    store[email] = defaultSettings(displayName);
    saveStore(store);
  }
  return store[email];
}

export function updateSettings(email: string, patch: Partial<UserSettings>): UserSettings {
  const store = loadStore();
  const existing = store[email] ?? defaultSettings(email.split("@")[0]);
  store[email] = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  saveStore(store);
  return store[email];
}
