import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Bell, Radio, Save, CheckCircle2, Mail, ShieldAlert, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type UserSettings = {
  displayName: string;
  emailAlertsEnabled: boolean;
  criticalThreatAlerts: boolean;
  threatFeedEnabled: boolean;
  updatedAt: string;
};

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const r = await fetch(`${import.meta.env.BASE_URL}api/user/settings`);
      if (!r.ok) throw new Error("Failed to load settings");
      return r.json() as Promise<UserSettings>;
    },
  });

  const [form, setForm] = useState<Partial<UserSettings>>({});

  const effective = { ...settings, ...form } as UserSettings;

  const mutation = useMutation({
    mutationFn: async (patch: Partial<UserSettings>) => {
      const r = await fetch(`${import.meta.env.BASE_URL}api/user/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!r.ok) {
        const err = (await r.json()) as { error: string };
        throw new Error(err.error ?? "Failed to save settings");
      }
      return r.json() as Promise<UserSettings>;
    },
    onSuccess: (data) => {
      qc.setQueryData(["user-settings"], data);
      setForm({});
      setSaved(true);
      refreshUser();
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  function handleSave() {
    if (Object.keys(form).length === 0) return;
    if (form.displayName !== undefined && form.displayName.trim().length < 2) {
      toast({ title: "Name too short", description: "Display name must be at least 2 characters.", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Loading your preferences…</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 bg-secondary/30 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    );
  }

  const isDirty = Object.keys(form).length > 0;

  return (
    <div className="space-y-8 pb-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
        </div>
        <AnimatePresence>
          {isDirty && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Button onClick={handleSave} disabled={mutation.isPending} className="shrink-0">
                {mutation.isPending ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" /> Saving…</span>
                ) : saved ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved!</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your name as it appears throughout SecureShield.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">
                {(effective.displayName ?? user?.name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={effective.displayName ?? ""}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Your name"
                maxLength={60}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Email is tied to your account and cannot be changed.</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Choose which alerts you want to receive by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-6 py-2">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Receive security notifications to {user?.email}.</p>
              </div>
            </div>
            <Switch
              checked={effective.emailAlertsEnabled ?? false}
              onCheckedChange={v => setForm(f => ({ ...f, emailAlertsEnabled: v }))}
            />
          </div>
          <div className="border-t border-border/50" />
          <div className={`flex items-center justify-between gap-6 py-2 transition-opacity ${!effective.emailAlertsEnabled ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Critical Threat Alerts</p>
                <p className="text-xs text-muted-foreground">Get emailed when a new CRITICAL exploit is added to the live threat feed.</p>
              </div>
            </div>
            <Switch
              checked={effective.criticalThreatAlerts ?? true}
              onCheckedChange={v => setForm(f => ({ ...f, criticalThreatAlerts: v }))}
            />
          </div>
          {!effective.emailAlertsEnabled && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 px-3 py-2 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Enable email alerts above to configure individual notification types.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <CardTitle>Threat Intelligence Feed</CardTitle>
          </div>
          <CardDescription>Control the live CISA exploit feed on your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-6 py-2">
            <div className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Show Live Threat Feed</p>
                <p className="text-xs text-muted-foreground">Display the real-time CISA Known Exploited Vulnerabilities feed on the Dashboard.</p>
              </div>
            </div>
            <Switch
              checked={effective.threatFeedEnabled ?? true}
              onCheckedChange={v => setForm(f => ({ ...f, threatFeedEnabled: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save bar (bottom sticky for mobile) */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden"
          >
            <Button size="lg" onClick={handleSave} disabled={mutation.isPending} className="shadow-2xl">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
