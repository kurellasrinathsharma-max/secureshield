import { useState } from "react";
import { Moon, Download, Trash, HardDrive, Battery, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type AppUpdate = {
  id: string;
  name: string;
  initial: string;
  icon: string;
  from: string;
  to: string;
  state: "pending" | "updating" | "updated";
};

const INITIAL_APPS: AppUpdate[] = [
  { id: "chrome", name: "Google Chrome", initial: "G", icon: "text-blue-500", from: "119.0.0.0", to: "120.0.0.0", state: "pending" },
  { id: "zoom", name: "Zoom Client", initial: "Z", icon: "text-blue-600", from: "5.16.0", to: "5.17.2", state: "pending" },
  { id: "vlc", name: "VLC Media Player", initial: "V", icon: "text-orange-500", from: "3.0.18", to: "3.0.21", state: "pending" },
  { id: "7zip", name: "7-Zip", initial: "7", icon: "text-primary", from: "23.00", to: "24.05", state: "pending" },
  { id: "spotify", name: "Spotify", initial: "S", icon: "text-safe", from: "1.2.26", to: "1.2.26", state: "updated" },
  { id: "vscode", name: "Visual Studio Code", initial: "C", icon: "text-blue-400", from: "1.84.2", to: "1.84.2", state: "updated" },
];

export default function Performance() {
  const [dndMode, setDndMode] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const [apps, setApps] = useState<AppUpdate[]>(INITIAL_APPS);
  const { toast } = useToast();

  const handleClean = () => {
    setCleaning(true);
    setCleaned(false);
    setCleanProgress(0);
    const interval = setInterval(() => {
      setCleanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCleaning(false);
          setCleaned(true);
          toast({ title: "Cleanup Complete", description: "2.4 GB of junk files removed successfully." });
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 150);
  };

  const updateApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, state: "updating" } : a));
    setTimeout(() => {
      setApps(prev => prev.map(a => a.id === id ? { ...a, state: "updated" } : a));
      const app = apps.find(a => a.id === id);
      toast({ title: "Update Complete", description: `${app?.name} updated to v${app?.to}.` });
    }, 2200);
  };

  const updateAll = () => {
    const pending = apps.filter(a => a.state === "pending");
    pending.forEach((app, i) => {
      setTimeout(() => {
        setApps(prev => prev.map(a => a.id === app.id ? { ...a, state: "updating" } : a));
        setTimeout(() => {
          setApps(prev => prev.map(a => a.id === app.id ? { ...a, state: "updated" } : a));
          if (i === pending.length - 1) toast({ title: "All Apps Updated", description: `${pending.length} apps updated successfully.` });
        }, 2000);
      }, i * 500);
    });
  };

  const pendingCount = apps.filter(a => a.state === "pending").length;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground mt-1">Keep your PC running fast, clean, and silent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cleanup */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <Trash className="w-5 h-5 mr-2 text-primary" />
              Cleanup Premium
            </CardTitle>
            <CardDescription>Remove junk files and free up disk space instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-5 p-5 bg-secondary/30 rounded-lg">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted opacity-20" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset={cleaned ? 264 : 40}
                    className={cleaned ? "text-safe transition-all duration-1000" : "text-warning"}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-lg font-bold ${cleaned ? "text-safe" : ""}`}>{cleaned ? "OK" : "85%"}</span>
                </div>
              </div>
              <div>
                {cleaned ? (
                  <p className="font-semibold text-lg text-safe">All Clean</p>
                ) : (
                  <p className="font-semibold text-lg text-warning">2.4 GB Junk Found</p>
                )}
                <p className="text-sm text-muted-foreground mt-0.5">
                  {cleaned ? "Your system is optimized and clean." : "Browser cache, temp files, broken registry items."}
                </p>
              </div>
            </div>
            {cleaning && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Removing junk files...</span>
                  <span>{Math.floor(cleanProgress)}%</span>
                </div>
                <Progress value={cleanProgress} className="h-2" />
              </div>
            )}
            <Button className="w-full" size="lg" onClick={handleClean} disabled={cleaning || cleaned} data-testid="btn-clean-now">
              {cleaning ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Cleaning...</> : cleaned ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Cleaned</> : "Clean Now"}
            </Button>
            {cleaned && (
              <Button variant="outline" className="w-full" size="sm" onClick={() => { setCleaned(false); setCleanProgress(0); }} data-testid="btn-rescan">
                Re-scan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Software Updater */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Software Updater
            </CardTitle>
            <CardDescription>Keep apps updated to patch security vulnerabilities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {apps.map(app => (
                <div key={app.id} className={`flex items-center justify-between p-2.5 rounded-md transition-colors ${app.state === "updated" ? "opacity-60" : "hover:bg-secondary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-xs border ${app.icon}`}>
                      {app.state === "updated" ? <CheckCircle2 className="w-4 h-4 text-safe" /> : app.initial}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.state === "updated" ? `v${app.to} — Up to date` : `v${app.from} → v${app.to}`}
                      </p>
                    </div>
                  </div>
                  {app.state === "updating" ? (
                    <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : app.state === "updated" ? null : (
                    <Button size="sm" variant="outline" className="text-xs h-7 shrink-0" onClick={() => updateApp(app.id)} data-testid={`btn-update-${app.id}`}>
                      Update
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full" onClick={updateAll} disabled={pendingCount === 0} data-testid="btn-update-all">
              {pendingCount > 0 ? `Update All (${pendingCount} pending)` : "All Apps Up to Date"}
            </Button>
          </CardFooter>
        </Card>

        {/* Do Not Disturb */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Moon className="w-5 h-5 mr-2 text-primary" />
                  Do Not Disturb Mode
                </CardTitle>
                <CardDescription className="mt-1">Silence notifications and boost gaming performance.</CardDescription>
              </div>
              <Switch
                checked={dndMode}
                onCheckedChange={(v) => { setDndMode(v); toast({ title: v ? "Do Not Disturb On" : "Do Not Disturb Off", description: v ? "All popups and alerts silenced." : "Notifications restored." }); }}
                className="data-[state=checked]:bg-primary"
                data-testid="switch-dnd"
              />
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {dndMode ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/10 border border-primary/20 p-3 rounded-md flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">DND Mode Active — All notifications suppressed</span>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary/30 p-3 rounded-md text-sm flex items-center gap-2">
                  <Badge variant="secondary">Auto</Badge>
                  <span className="text-muted-foreground">Monitoring for fullscreen apps.</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-4 space-y-2">
              {["Block notification popups", "Pause scheduled scans", "Optimize CPU for foreground app", "Suppress update reminders"].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${dndMode ? "text-safe" : "text-muted-foreground/40"}`} />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Battery Saver */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-primary" />
                  Battery Saver
                </CardTitle>
                <CardDescription className="mt-1">Extend laptop battery life intelligently.</CardDescription>
              </div>
              <Switch
                checked={batterySaver}
                onCheckedChange={(v) => { setBatterySaver(v); toast({ title: v ? "Battery Saver Enabled" : "Battery Saver Disabled", description: v ? "Power consumption reduced." : "Full performance restored." }); }}
                className="data-[state=checked]:bg-safe"
                data-testid="switch-battery-saver"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Battery Level</span>
                <span className="font-bold">{batterySaver ? "Extending — 6h 40m" : "4h 15m"}</span>
              </div>
              <Progress value={62} className={`h-3 ${batterySaver ? "[&>div]:bg-safe" : "[&>div]:bg-warning"}`} />
              <div className="text-xs text-muted-foreground text-right">62% — {batterySaver ? "Power saving active" : "Normal usage"}</div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Reduce background scans", enabled: batterySaver },
                { label: "Lower display brightness", enabled: batterySaver },
                { label: "Suspend non-critical updates", enabled: batterySaver },
                { label: "Throttle idle CPU usage", enabled: batterySaver },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.enabled ? "text-safe" : "text-muted-foreground/30"}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
