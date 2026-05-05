import { Router } from "express";
import { getSettings, updateSettings, type UserSettings } from "../lib/user-store";

const router = Router();

function requireAuth(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1], next: Parameters<Parameters<typeof router.use>[0]>[2]) {
  if (!req.session?.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  next();
}

router.get("/user/settings", requireAuth, (req, res) => {
  const { email, name } = req.session.user!;
  res.json(getSettings(email, name));
});

router.patch("/user/settings", requireAuth, (req, res) => {
  const { email } = req.session.user!;
  const body = req.body as Partial<UserSettings>;

  const allowed: (keyof UserSettings)[] = [
    "displayName",
    "emailAlertsEnabled",
    "criticalThreatAlerts",
    "threatFeedEnabled",
  ];

  const patch: Partial<UserSettings> = {};
  for (const key of allowed) {
    if (key in body) {
      (patch as Record<string, unknown>)[key] = body[key];
    }
  }

  if (patch.displayName !== undefined) {
    const name = (patch.displayName as string).trim();
    if (name.length < 2 || name.length > 60) {
      res.status(400).json({ error: "Display name must be 2–60 characters." });
      return;
    }
    patch.displayName = name;
    req.session.user!.name = name;
  }

  const updated = updateSettings(email, patch);
  res.json(updated);
});

export default router;
