import { useState, useEffect } from "react";
import { ShieldCheck, Wifi, EyeOff, Trash2, Key, HardDrive, WifiOff, CheckCircle2, RefreshCw, Globe, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const VPN_SERVERS = [
  { country: "United States", city: "New York", ping: 12, flag: "US" },
  { country: "United Kingdom", city: "London", ping: 28, flag: "GB" },
  { country: "Germany", city: "Frankfurt", ping: 34, flag: "DE" },
  { country: "Japan", city: "Tokyo", ping: 87, flag: "JP" },
  { country: "Singapore", city: "Singapore", ping: 104, flag: "SG" },
  { country: "Canada", city: "Toronto", ping: 18, flag: "CA" },
];

const DRIVERS = [
  { name: "NVIDIA GeForce RTX 4070", version: "537.42", latest: "551.23", status: "outdated" },
  { name: "Realtek High Definition Audio", version: "6.0.9171.1", latest: "6.0.9316.1", status: "outdated" },
  { name: "Intel Wi-Fi 6E AX210", version: "22.200.0.5", latest: "23.80.0.3", status: "outdated" },
  { name: "Intel USB 3.0 Host Controller", version: "5.0.4.43", latest: "5.0.4.43", status: "current" },
  { name: "Generic Bluetooth Adapter", version: "10.0.19041", latest: "22621.1", status: "outdated" },
];

const DUPLICATES = [
  { name: "family_photo_2023.jpg", copies: 3, size: "14.2 MB", paths: ["Desktop", "Downloads", "OneDrive"] },
  { name: "resume_final.pdf", copies: 4, size: "2.1 MB", paths: ["Documents", "Downloads", "Desktop", "Email Attachments"] },
  { name: "project_backup.zip", copies: 2, size: "890 MB", paths: ["Documents\\Backup", "D:\\Archives"] },
  { name: "vacation_video.mp4", copies: 2, size: "2.4 GB", paths: ["Videos", "Downloads"] },
];

export default function SecurityTools() {
  const [vpnConnected, setVpnConnected] = useState(false);
  const [vpnConnecting, setVpnConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(VPN_SERVERS[0]);
  const [vpnServerOpen, setVpnServerOpen] = useState(false);
  const [chromeTrack, setChromeTrack] = useState(true);
  const [firefoxTrack, setFirefoxTrack] = useState(false);
  const [edgeTrack, setEdgeTrack] = useState(true);
  const [trackCount, setTrackCount] = useState(1492);
  const [driverStates, setDriverStates] = useState<Record<string, string>>({});
  const [scanningDuplicates, setScanningDuplicates] = useState(false);
  const [duplicateScanProgress, setDuplicateScanProgress] = useState(0);
  const [duplicatesFound, setDuplicatesFound] = useState(false);
  const [deletingDuplicate, setDeletingDuplicate] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState(DUPLICATES);
  const [breachEmail, setBreachEmail] = useState("user@example.com");
  const { toast } = useToast();

  useEffect(() => {
    if (!vpnConnected) return;
    const interval = setInterval(() => setTrackCount(p => p + Math.floor(Math.random() * 3)), 3000);
    return () => clearInterval(interval);
  }, [vpnConnected]);

  const toggleVPN = () => {
    if (vpnConnected) {
      setVpnConnected(false);
      toast({ title: "VPN Disconnected", description: "Your real IP is now visible.", variant: "destructive" });
    } else {
      setVpnConnecting(true);
      toast({ title: "Connecting to VPN...", description: `Routing through ${selectedServer.city}, ${selectedServer.country}` });
      setTimeout(() => {
        setVpnConnecting(false);
        setVpnConnected(true);
        toast({ title: "VPN Connected", description: `Protected via ${selectedServer.city} — ${selectedServer.ping}ms` });
      }, 2200);
    }
  };

  const updateDriver = (name: string) => {
    setDriverStates(prev => ({ ...prev, [name]: "updating" }));
    setTimeout(() => {
      setDriverStates(prev => ({ ...prev, [name]: "updated" }));
      toast({ title: "Driver Updated", description: `${name} has been updated successfully.` });
    }, 2500);
  };

  const updateAllDrivers = () => {
    const outdated = DRIVERS.filter(d => d.status === "outdated").map(d => d.name);
    outdated.forEach((name, i) => {
      setTimeout(() => {
        setDriverStates(prev => ({ ...prev, [name]: "updating" }));
        setTimeout(() => {
          setDriverStates(prev => ({ ...prev, [name]: "updated" }));
          if (i === outdated.length - 1) toast({ title: "All Drivers Updated", description: "Your system drivers are now up to date." });
        }, 2000);
      }, i * 600);
    });
  };

  const scanDuplicates = () => {
    setScanningDuplicates(true);
    setDuplicateScanProgress(0);
    setDuplicatesFound(false);
    const interval = setInterval(() => {
      setDuplicateScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningDuplicates(false);
          setDuplicatesFound(true);
          return 100;
        }
        return prev + Math.random() * 6;
      });
    }, 200);
  };

  const deleteDuplicate = (name: string) => {
    setDeletingDuplicate(name);
    setTimeout(() => {
      setDuplicates(prev => prev.filter(d => d.name !== name));
      setDeletingDuplicate(null);
      toast({ title: "Duplicates Removed", description: `Extra copies of ${name} deleted.` });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Tools</h1>
        <p className="text-muted-foreground mt-1">Advanced utilities to enhance your digital security posture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* VPN */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              {vpnConnected ? <ShieldCheck className="w-6 h-6 text-safe" /> : <Wifi className="w-6 h-6 text-primary" />}
            </div>
            <CardTitle>SecureLine VPN</CardTitle>
            <CardDescription>Encrypt your internet connection to stay private on any network.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {vpnConnected ? (
                <motion.div key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-safe/10 border border-safe/20 rounded-lg p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                    <span className="font-bold text-safe">Connected — Protected</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedServer.city}, {selectedServer.country} — {selectedServer.ping}ms</p>
                  <p className="text-xs text-muted-foreground">Trackers blocked this session: <span className="font-bold text-foreground">{trackCount.toLocaleString()}</span></p>
                </motion.div>
              ) : (
                <motion.div key="disconnected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-1 py-6">
                  <WifiOff className="w-8 h-8 text-muted-foreground opacity-50 mb-1" />
                  <p className="font-medium text-sm">VPN Disconnected</p>
                  <p className="text-xs text-muted-foreground">Your IP address is currently visible.</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Server Location</label>
              <Select value={`${selectedServer.city}`} onValueChange={(val) => setSelectedServer(VPN_SERVERS.find(s => s.city === val) || VPN_SERVERS[0])} disabled={vpnConnected}>
                <SelectTrigger data-testid="select-vpn-server">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VPN_SERVERS.map(server => (
                    <SelectItem key={server.city} value={server.city}>
                      <div className="flex items-center justify-between w-full gap-8">
                        <span>{server.city}, {server.country}</span>
                        <span className="text-xs text-muted-foreground">{server.ping}ms</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className={`w-full ${vpnConnected ? "bg-destructive hover:bg-destructive/90" : ""}`}
              onClick={toggleVPN}
              disabled={vpnConnecting}
              data-testid="btn-vpn-toggle"
            >
              {vpnConnecting ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
              ) : vpnConnected ? (
                "Disconnect VPN"
              ) : (
                "Connect to VPN"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* AntiTrack */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <EyeOff className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>AntiTrack</CardTitle>
            <CardDescription>Stop advertisers and trackers from monitoring your browsing.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-5">
            <div className="flex items-end gap-4 p-4 bg-secondary/30 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Tracking Attempts Blocked</div>
                <div className="text-3xl font-bold text-safe font-mono">{trackCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Last 30 days</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browser Protection</div>
              {[
                { name: "Google Chrome", state: chromeTrack, setter: setChromeTrack, id: "chrome" },
                { name: "Microsoft Edge", state: edgeTrack, setter: setEdgeTrack, id: "edge" },
                { name: "Mozilla Firefox", state: firefoxTrack, setter: setFirefoxTrack, id: "firefox" },
              ].map(browser => (
                <div key={browser.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${browser.state ? "bg-safe" : "bg-muted-foreground/30"}`} />
                    <span>{browser.name}</span>
                  </div>
                  <Switch
                    checked={browser.state}
                    onCheckedChange={(v) => { browser.setter(v); toast({ title: `${browser.name} ${v ? "Protected" : "Unprotected"}`, description: v ? "Tracking blocked in this browser." : "Tracking is no longer blocked." }); }}
                    className="data-[state=checked]:bg-safe"
                    data-testid={`switch-antitrack-${browser.id}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => toast({ title: "AntiTrack Dashboard", description: "Detailed tracker report loaded." })} data-testid="btn-antitrack-dashboard">
              View Full Report
            </Button>
          </CardFooter>
        </Card>

        {/* Driver Updater */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Driver Updater</CardTitle>
            <CardDescription>Fix hardware issues by keeping your PC drivers current.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {DRIVERS.map((driver) => {
              const state = driverStates[driver.name];
              const isOutdated = driver.status === "outdated" && state !== "updated";
              return (
                <div key={driver.name} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {state === "updated" ? `v${driver.latest} — Up to date` : `v${driver.version} → v${driver.latest}`}
                    </div>
                  </div>
                  {state === "updated" || driver.status === "current" ? (
                    <CheckCircle2 className="w-5 h-5 text-safe shrink-0" />
                  ) : state === "updating" ? (
                    <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <Button size="sm" variant="outline" className="shrink-0 text-xs h-7 text-warning border-warning/50 hover:bg-warning/10" onClick={() => updateDriver(driver.name)} data-testid={`btn-update-driver-${driver.name}`}>
                      Update
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={updateAllDrivers} data-testid="btn-update-all-drivers">
              Update All Outdated Drivers
            </Button>
          </CardFooter>
        </Card>

        {/* Duplicate Finder */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Duplicate Finder</CardTitle>
            <CardDescription>Find and remove duplicate files wasting your disk space.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {!duplicatesFound && !scanningDuplicates && (
              <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 rounded-lg border border-dashed border-border text-center">
                <Search className="w-10 h-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-medium">Ready to scan</p>
                <p className="text-xs text-muted-foreground mt-1">Scans documents, pictures, and videos for exact duplicates.</p>
              </div>
            )}
            {scanningDuplicates && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scanning files...</span>
                  <span className="font-mono">{Math.floor(duplicateScanProgress)}%</span>
                </div>
                <Progress value={duplicateScanProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">Analyzing file hashes across all drives...</p>
              </div>
            )}
            {duplicatesFound && (
              <AnimatePresence>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-warning mb-2">{duplicates.length} duplicate groups found — {duplicates.reduce((acc, d) => acc + parseInt(d.size), 0).toFixed(0)} MB recoverable</div>
                  {duplicates.map((dup) => (
                    <motion.div key={dup.name} layout initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="p-2.5 rounded-md bg-secondary/30 border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{dup.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{dup.copies} copies — {dup.size} total</div>
                          <div className="text-xs text-muted-foreground">{dup.paths.join(" • ")}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          disabled={deletingDuplicate === dup.name}
                          onClick={() => deleteDuplicate(dup.name)}
                          data-testid={`btn-delete-dup-${dup.name}`}
                        >
                          {deletingDuplicate === dup.name ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Remove Copies"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={scanDuplicates} disabled={scanningDuplicates} data-testid="btn-scan-duplicates">
              {scanningDuplicates ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Scanning...</> : <><Search className="w-4 h-4 mr-2" /> Find Duplicates</>}
            </Button>
          </CardFooter>
        </Card>

        {/* Breach Guard */}
        <Card className="flex flex-col md:col-span-2">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Breach Guard</CardTitle>
            <CardDescription>Monitor the dark web for your leaked credentials and personal data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={breachEmail}
                    onChange={e => setBreachEmail(e.target.value)}
                    placeholder="Enter email to monitor"
                    data-testid="input-breach-email"
                  />
                  <Button onClick={() => toast({ title: "Monitoring Active", description: `${breachEmail} is being monitored for new breaches.` })} data-testid="btn-breach-check">
                    Monitor
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">We continuously monitor breach databases and alert you the moment your data appears.</p>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Known Breaches for {breachEmail}</div>
                {[
                  { name: "Canva (2019)", data: "Email, Password, Name", risk: "high" },
                  { name: "LinkedIn (2021)", data: "Email, Phone, Location", risk: "medium" },
                  { name: "RockYou2024 Compilation", data: "Password Hash", risk: "critical" },
                ].map((breach) => (
                  <div key={breach.name} className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border">
                    <div>
                      <div className="font-semibold text-sm">{breach.name}</div>
                      <div className="text-xs text-muted-foreground">{breach.data}</div>
                    </div>
                    <Badge variant="outline" className={breach.risk === "critical" ? "text-destructive border-destructive" : breach.risk === "high" ? "text-warning border-warning" : "text-muted-foreground"}>
                      {breach.risk.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
