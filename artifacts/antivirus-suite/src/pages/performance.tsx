import { useState } from "react";
import { Zap, Moon, Download, Trash, HardDrive, Battery, Gauge, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Performance() {
  const [dndMode, setDndMode] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const handleClean = () => {
    setCleaning(true);
    setTimeout(() => setCleaning(false), 2000);
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground mt-1">Keep your PC running fast, clean, and silent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Trash className="w-5 h-5 mr-2 text-primary" />
                  Cleanup Premium
                </CardTitle>
                <CardDescription className="mt-1">Remove junk files and free up disk space.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-secondary/30 rounded-lg">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted opacity-20" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset="40" className="text-warning" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">85%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-lg text-warning">2.4 GB Junk Found</p>
                <p className="text-sm text-muted-foreground">Includes browser cache, temporary system files, and broken registry items.</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleClean} disabled={cleaning}>
              {cleaning ? "Cleaning..." : "Clean Now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Software Updater
            </CardTitle>
            <CardDescription>Keep apps updated to patch security vulnerabilities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center font-bold text-xs border">G</div>
                  <div>
                    <p className="font-semibold text-sm">Google Chrome</p>
                    <p className="text-xs text-muted-foreground">v119.0.0.0 → v120.0.0.0</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Update</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center font-bold text-xs border">Z</div>
                  <div>
                    <p className="font-semibold text-sm">Zoom Client</p>
                    <p className="text-xs text-muted-foreground">v5.16.0 → v5.17.2</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Update</Button>
              </div>
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center font-bold text-xs border text-safe"><CheckCircle2 className="w-4 h-4"/></div>
                  <div>
                    <p className="font-semibold text-sm">Spotify</p>
                    <p className="text-xs text-muted-foreground">Up to date</p>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-6">Update All Apps</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Moon className="w-5 h-5 mr-2 text-primary" />
                  Do Not Disturb Mode
                </CardTitle>
                <CardDescription className="mt-1">Silence notifications and boost game performance.</CardDescription>
              </div>
              <Switch checked={dndMode} onCheckedChange={setDndMode} className="data-[state=checked]:bg-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">When enabled, SecureShield automatically blocks popups and optimizes CPU/RAM usage when you are playing a game in fullscreen.</p>
            <div className="bg-secondary/30 p-3 rounded-md text-sm flex items-center gap-2">
              <Badge variant="secondary">Auto</Badge>
              <span>Currently monitoring for fullscreen apps.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-primary" />
                  Battery Saver
                </CardTitle>
                <CardDescription className="mt-1">Extend laptop battery life.</CardDescription>
              </div>
              <Switch checked={batterySaver} onCheckedChange={setBatterySaver} className="data-[state=checked]:bg-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Time Remaining</span>
                  <span className="font-bold">4h 15m</span>
                </div>
                <Progress value={62} className="h-2 [&>div]:bg-safe" />
              </div>
              <p className="text-sm text-muted-foreground">
                Reduces background activity, lowers display brightness, and suspends non-critical updates when unplugged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
