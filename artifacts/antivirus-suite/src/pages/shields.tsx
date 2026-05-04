import { useState } from "react";
import { Shield, HardDrive, Globe, Mail, Lock, Box, Wifi, AlertTriangle, ShieldCheck, Flame, CreditCard, Monitor, AtSign, ScanLine, X, RotateCcw, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type ShieldState = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  level: string;
  lastActivity: string;
};

type QuarantineItem = {
  id: number;
  name: string;
  threat: string;
  path: string;
  date: string;
  severity: "critical" | "high" | "medium";
  removed: boolean;
};

const INITIAL_SHIELDS: ShieldState[] = [
  { id: "file", name: "File Shield", description: "Scans all files added to or opened on your PC in real time.", icon: HardDrive, active: true, level: "standard", lastActivity: "2 min ago" },
  { id: "behavior", name: "Behavior Shield", description: "Warns if applications behave suspiciously or maliciously.", icon: Shield, active: true, level: "standard", lastActivity: "12 min ago" },
  { id: "web", name: "Web Guard", description: "Blocks web attacks, malicious domains, and unsafe downloads.", icon: Globe, active: true, level: "aggressive", lastActivity: "Just now" },
  { id: "mail", name: "Mail Shield", description: "Blocks dangerous email attachments and phishing links.", icon: Mail, active: true, level: "standard", lastActivity: "1h ago" },
  { id: "ransomware", name: "Ransomware Shield", description: "Secures personal folders from unauthorized encryption.", icon: Lock, active: true, level: "strict", lastActivity: "3h ago" },
  { id: "sandbox", name: "Sandbox", description: "Test suspicious files in a completely isolated environment.", icon: Box, active: false, level: "standard", lastActivity: "Never" },
  { id: "firewall", name: "Firewall", description: "Controls inbound and outbound network traffic.", icon: Flame, active: true, level: "standard", lastActivity: "5 min ago" },
  { id: "bankmode", name: "Bank Mode", description: "Isolated browser session for safe online banking.", icon: CreditCard, active: false, level: "standard", lastActivity: "Never" },
  { id: "remote", name: "Remote Access Shield", description: "Blocks unauthorized remote desktop and VNC connections.", icon: Monitor, active: true, level: "aggressive", lastActivity: "Yesterday" },
  { id: "emailguard", name: "Email Guard", description: "Monitors SMTP/IMAP traffic for outbound data leaks.", icon: AtSign, active: true, level: "standard", lastActivity: "30 min ago" },
  { id: "realsite", name: "Real Site", description: "Prevents DNS hijacking to keep you on legitimate websites.", icon: ShieldCheck, active: true, level: "standard", lastActivity: "1 min ago" },
];

const INITIAL_QUARANTINE: QuarantineItem[] = [
  { id: 1, name: "Trojan.GenericKD.47821", threat: "Trojan", path: "C:\\Users\\Admin\\Downloads\\setup_crack.exe", date: "Today, 09:14 AM", severity: "critical", removed: false },
  { id: 2, name: "PUP.Optional.OpenCandy", threat: "Potentially Unwanted", path: "C:\\Program Files\\FreeConverter\\bundled.dll", date: "Today, 08:52 AM", severity: "medium", removed: false },
  { id: 3, name: "Win32.Backdoor.Hupigon", threat: "Backdoor", path: "C:\\Windows\\Temp\\svchost32.exe", date: "Yesterday, 11:30 PM", severity: "critical", removed: false },
  { id: 4, name: "Adware.BrowseFox.B", threat: "Adware", path: "C:\\Program Files (x86)\\BrowseFox\\bfox.dll", date: "Yesterday, 4:18 PM", severity: "medium", removed: false },
  { id: 5, name: "Exploit.CVE-2023-1234", threat: "Exploit", path: "C:\\Users\\Admin\\AppData\\Roaming\\exploit.pdf", date: "Oct 12, 2:45 PM", severity: "high", removed: false },
  { id: 6, name: "Worm.Conficker.D", threat: "Worm", path: "C:\\Windows\\System32\\tasksche.exe", date: "Oct 11, 10:20 AM", severity: "critical", removed: false },
  { id: 7, name: "Spyware.AgentTesla", threat: "Spyware", path: "C:\\Users\\Admin\\AppData\\Local\\agent.exe", date: "Oct 10, 3:00 PM", severity: "high", removed: false },
  { id: 8, name: "Ransom.WannaCry.Gen", threat: "Ransomware", path: "C:\\temp\\wcrypt.exe", date: "Oct 9, 9:15 AM", severity: "critical", removed: false },
];

const NETWORK_DEVICES = [
  { ip: "192.168.1.1", name: "NETGEAR-R7000 (Router)", type: "Router", status: "secure", ports: [] },
  { ip: "192.168.1.2", name: "This PC (DESKTOP-K4N2V1)", type: "Computer", status: "secure", ports: [] },
  { ip: "192.168.1.5", name: "Samsung Smart TV", type: "Smart Device", status: "warning", ports: ["8888 (Unprotected)"] },
  { ip: "192.168.1.8", name: "iPhone 15 Pro", type: "Mobile", status: "secure", ports: [] },
  { ip: "192.168.1.12", name: "Ring Doorbell", type: "IoT", status: "warning", ports: ["80 (HTTP exposed)"] },
];

export default function Shields() {
  const [shields, setShields] = useState<ShieldState[]>(INITIAL_SHIELDS);
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>(INITIAL_QUARANTINE);
  const [networkScanning, setNetworkScanning] = useState(false);
  const [networkScanProgress, setNetworkScanProgress] = useState(0);
  const [networkScanned, setNetworkScanned] = useState(false);
  const [quarantineOpen, setQuarantineOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const { toast } = useToast();

  const toggleShield = (id: string) => {
    setShields(prev => prev.map(s => {
      if (s.id === id) {
        const newState = !s.active;
        toast({
          title: `${s.name} ${newState ? "Enabled" : "Disabled"}`,
          description: newState ? "Shield is now active and protecting your system." : "Warning: This protection layer is now inactive.",
          variant: newState ? "default" : "destructive",
        });
        return { ...s, active: newState };
      }
      return s;
    }));
  };

  const changeLevel = (id: string, level: string) => {
    setShields(prev => prev.map(s => s.id === id ? { ...s, level } : s));
    toast({ title: "Sensitivity Updated", description: "New security rules applied." });
  };

  const startNetworkScan = () => {
    setNetworkScanning(true);
    setNetworkScanProgress(0);
    setNetworkScanned(false);
    const interval = setInterval(() => {
      setNetworkScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNetworkScanning(false);
          setNetworkScanned(true);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 200);
  };

  const restoreItem = (id: number) => {
    const item = quarantine.find(q => q.id === id);
    toast({ title: "File Restored", description: `${item?.name} has been moved out of quarantine.`, variant: "destructive" });
    setQuarantine(prev => prev.filter(q => q.id !== id));
  };

  const deleteItem = (id: number) => {
    const item = quarantine.find(q => q.id === id);
    toast({ title: "File Permanently Deleted", description: `${item?.name} has been securely erased.` });
    setQuarantine(prev => prev.filter(q => q.id !== id));
  };

  const emptyQuarantine = () => {
    toast({ title: "Quarantine Emptied", description: `${quarantine.length} threats permanently deleted.` });
    setQuarantine([]);
    setQuarantineOpen(false);
  };

  const severityColor = (severity: QuarantineItem["severity"]) => {
    if (severity === "critical") return "text-destructive border-destructive";
    if (severity === "high") return "text-warning border-warning";
    return "text-muted-foreground";
  };

  const activeCount = shields.filter(s => s.active).length;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Core Shields</h1>
          <p className="text-muted-foreground mt-1">Configure your real-time protection layers.</p>
        </div>
        <div className="flex items-center gap-2 bg-safe/10 text-safe px-4 py-2 rounded-full border border-safe/20">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-sm font-medium">{activeCount}/{shields.length} shields active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shields.map((shield, i) => (
          <motion.div key={shield.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={`h-full transition-all duration-300 ${shield.active ? "border-primary/20 shadow-sm shadow-primary/5" : "opacity-60 grayscale-[50%]"}`}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 flex-1 mr-3">
                  <CardTitle className="flex items-center text-base">
                    <shield.icon className={`w-4 h-4 mr-2 shrink-0 ${shield.active ? "text-primary" : "text-muted-foreground"}`} />
                    {shield.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{shield.description}</CardDescription>
                </div>
                <Switch
                  checked={shield.active}
                  onCheckedChange={() => toggleShield(shield.id)}
                  className="mt-0.5 data-[state=checked]:bg-safe shrink-0"
                  data-testid={`toggle-shield-${shield.id}`}
                />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Select disabled={!shield.active} value={shield.level} onValueChange={(val) => changeLevel(shield.id, val)}>
                    <SelectTrigger className="w-[110px] h-7 text-xs" data-testid={`select-level-${shield.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${shield.active ? "bg-safe animate-pulse" : "bg-muted-foreground/40"}`} />
                    {shield.active ? shield.lastActivity : "Inactive"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Advanced Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Network Inspector */}
          <Dialog open={networkOpen} onOpenChange={setNetworkOpen}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-primary" />
                  Network Inspector
                </CardTitle>
                <CardDescription>Scan your local network for vulnerable devices and open ports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Connected Network</div>
                    <div className="text-lg font-bold">Home_Wi-Fi_5G</div>
                    <div className="text-xs text-muted-foreground mt-0.5">192.168.1.x — 5 devices detected</div>
                  </div>
                  <Badge variant="outline" className="text-safe border-safe bg-safe/10">Secure</Badge>
                </div>
                {networkScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Scanning network...</span>
                      <span>{Math.floor(networkScanProgress)}%</span>
                    </div>
                    <Progress value={networkScanProgress} className="h-1.5" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={startNetworkScan} disabled={networkScanning} data-testid="btn-scan-network">
                    <ScanLine className="w-4 h-4 mr-2" />
                    {networkScanning ? "Scanning..." : "Scan Network"}
                  </Button>
                  {networkScanned && (
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="btn-view-results">View Results</Button>
                    </DialogTrigger>
                  )}
                </div>
              </CardContent>
            </Card>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-primary" />
                  Network Scan Results
                </DialogTitle>
                <DialogDescription>5 devices found. 2 with potential vulnerabilities.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {NETWORK_DEVICES.map((device) => (
                  <div key={device.ip} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                    <div>
                      <div className="font-semibold text-sm">{device.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{device.ip} — {device.type}</div>
                      {device.ports.length > 0 && (
                        <div className="text-xs text-warning mt-1">Open ports: {device.ports.join(", ")}</div>
                      )}
                    </div>
                    <Badge variant="outline" className={device.status === "secure" ? "text-safe border-safe" : "text-warning border-warning"}>
                      {device.status === "secure" ? "Secure" : "Warning"}
                    </Badge>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Quarantine */}
          <Dialog open={quarantineOpen} onOpenChange={setQuarantineOpen}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                  Quarantine
                </CardTitle>
                <CardDescription>Manage isolated dangerous files. They cannot harm your system here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Isolated Threats</div>
                    <div className={`text-2xl font-bold mt-1 ${quarantine.length > 0 ? "text-warning" : "text-safe"}`}>
                      {quarantine.length} {quarantine.length === 1 ? "File" : "Files"}
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="btn-view-quarantine">
                      View Files
                    </Button>
                  </DialogTrigger>
                </div>
                <Button
                  variant="secondary"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={quarantine.length === 0}
                  onClick={emptyQuarantine}
                  data-testid="btn-empty-quarantine"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Empty Quarantine
                </Button>
              </CardContent>
            </Card>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Quarantined Threats
                </DialogTitle>
                <DialogDescription>
                  {quarantine.length} threat{quarantine.length !== 1 ? "s" : ""} isolated. Restore only if you are certain a file is safe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-2">
                <AnimatePresence>
                  {quarantine.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-safe opacity-50" />
                      <p className="font-medium">Quarantine is empty</p>
                      <p className="text-sm">No threats are currently isolated.</p>
                    </div>
                  ) : (
                    quarantine.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border overflow-hidden"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm">{item.name}</span>
                            <Badge variant="outline" className={`text-xs shrink-0 ${severityColor(item.severity)}`}>
                              {item.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{item.path}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{item.threat} — {item.date}</div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => restoreItem(item.id)}
                            data-testid={`btn-restore-${item.id}`}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteItem(item.id)}
                            data-testid={`btn-delete-${item.id}`}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                {quarantine.length > 0 && (
                  <Button variant="destructive" className="w-full mt-4" onClick={emptyQuarantine} data-testid="btn-empty-all">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All {quarantine.length} Threats Permanently
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
