import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Shield, CheckCircle2, Clock, FolderOpen, RefreshCw, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MOCK_PATHS = [
  "C:\\Windows\\System32\\drivers\\etc\\hosts",
  "C:\\Users\\Admin\\AppData\\Local\\Temp\\~DF3A.tmp",
  "C:\\Program Files\\Common Files\\System\\ado\\msado15.dll",
  "C:\\Windows\\System32\\svchost.exe",
  "C:\\Users\\Admin\\Downloads\\setup_v2.exe",
  "C:\\Windows\\Prefetch\\AgAppLaunch.db",
  "C:\\ProgramData\\Microsoft\\Windows\\AppRepository\\Packages.txt",
  "C:\\Users\\Admin\\Documents\\Invoice_Q3.pdf",
  "C:\\Windows\\System32\\config\\SOFTWARE",
  "C:\\Program Files (x86)\\Common Files\\Adobe\\Acrobat\\ActiveX\\AcroIEHelper.dll",
  "C:\\Windows\\SysWOW64\\ntdll.dll",
  "C:\\Users\\Admin\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations",
];

const FULL_PATHS = [
  ...MOCK_PATHS,
  "C:\\Windows\\System32\\wbem\\WmiApSrv.exe",
  "C:\\Program Files\\Windows Defender\\MpCmdRun.exe",
  "C:\\Users\\Admin\\Documents\\Projects\\source\\main.exe",
  "D:\\Backups\\system_image.vhd",
  "D:\\Downloads\\video_converter_free.exe",
  "C:\\Windows\\System32\\drivers\\tcpip.sys",
];

const SCAN_HISTORY = [
  { id: 1, date: "Today, 10:23 AM", type: "Smart Scan", duration: "2m 14s", files: "18,492", threats: 0, status: "Clean" },
  { id: 2, date: "Yesterday, 08:00 PM", type: "Full Virus Scan", duration: "45m 30s", files: "382,210", threats: 2, status: "Resolved" },
  { id: 3, date: "Oct 12, 2:15 PM", type: "Targeted Scan", duration: "0m 45s", files: "3,012", threats: 0, status: "Clean" },
  { id: 4, date: "Oct 10, 9:00 AM", type: "Boot-Time Scan", duration: "15m 20s", files: "94,831", threats: 0, status: "Clean" },
  { id: 5, date: "Oct 7, 11:42 AM", type: "Custom Scan", duration: "8m 05s", files: "42,887", threats: 1, status: "Resolved" },
  { id: 6, date: "Sep 30, 9:00 AM", type: "Full Virus Scan", duration: "52m 18s", files: "401,994", threats: 0, status: "Clean" },
];

const SCAN_TARGETS = [
  { id: "system32", label: "C:\\Windows\\System32", size: "~12 GB" },
  { id: "program_files", label: "C:\\Program Files", size: "~38 GB" },
  { id: "program_files_x86", label: "C:\\Program Files (x86)", size: "~22 GB" },
  { id: "users", label: "C:\\Users\\Admin", size: "~85 GB" },
  { id: "appdata", label: "AppData (all users)", size: "~5 GB" },
  { id: "temp", label: "Temp & Cache Folders", size: "~2.4 GB" },
  { id: "d_drive", label: "D:\\ (Data Drive)", size: "~340 GB" },
  { id: "startup", label: "Startup Programs", size: "~150 MB" },
];

function ScanPanel({ paths, label, description, estimatedTime }: { paths: string[]; label: string; description: string; estimatedTime: string }) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState("");
  const [scannedFiles, setScannedFiles] = useState(0);
  const [threats, setThreats] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const pathRef = useRef<NodeJS.Timeout | null>(null);

  const clearAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (pathRef.current) clearInterval(pathRef.current);
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  useEffect(() => {
    if (progress >= 100 && scanning) {
      clearAll();
      setScanning(false);
      setDone(true);
    }
  }, [progress, scanning, clearAll]);

  const startScan = () => {
    setScanning(true);
    setDone(false);
    setProgress(0);
    setScannedFiles(0);
    setThreats(0);
    setElapsed(0);
    toast({ title: `${label} Started`, description: "Analyzing your system for threats." });

    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(100, p + Math.random() * 2));
      setScannedFiles(p => p + Math.floor(Math.random() * 180) + 40);
      if (Math.random() > 0.985) setThreats(p => p + 1);
    }, 200);
    pathRef.current = setInterval(() => setCurrentPath(paths[Math.floor(Math.random() * paths.length)]), 130);
  };

  const stopScan = () => {
    clearAll();
    setScanning(false);
    toast({ title: "Scan Aborted", description: "The scan was cancelled.", variant: "destructive" });
  };

  const resetScan = () => {
    setProgress(0);
    setDone(false);
    setScannedFiles(0);
    setThreats(0);
    setElapsed(0);
    setCurrentPath("");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <Card className="border-2 border-primary/10 bg-card/50">
      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          {!scanning && !done ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[spin_12s_linear_infinite]" />
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{label}</h2>
              <p className="text-muted-foreground max-w-md mb-1 text-sm">{description}</p>
              <p className="text-xs text-muted-foreground mb-8">Estimated time: {estimatedTime}</p>
              <Button size="lg" className="w-44 text-base h-12 rounded-full shadow-lg shadow-primary/20" onClick={startScan} data-testid={`btn-start-${label.replace(/\s+/g, "-").toLowerCase()}`}>
                <Play className="w-4 h-4 mr-2" /> Start Scan
              </Button>
            </motion.div>
          ) : (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold">{done ? "Scan Complete" : "Scanning..."}</h2>
                  <p className="text-xs font-mono text-muted-foreground mt-1.5 truncate w-64 md:w-80">
                    {done ? `${scannedFiles.toLocaleString()} files scanned — ${threats} threat${threats !== 1 ? "s" : ""} found` : currentPath}
                  </p>
                </div>
                <div className="text-4xl font-bold font-mono text-primary">{Math.min(100, Math.floor(progress))}%</div>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-secondary/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Files Scanned</div>
                  <div className="text-xl font-bold font-mono">{scannedFiles.toLocaleString()}</div>
                </div>
                <div className="bg-secondary/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Threats Found</div>
                  <div className={`text-xl font-bold font-mono ${threats > 0 ? "text-destructive" : "text-safe"}`}>{threats}</div>
                </div>
                <div className="bg-secondary/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Elapsed</div>
                  <div className="text-xl font-bold font-mono">{fmt(elapsed)}</div>
                </div>
                <div className="bg-secondary/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="text-base font-bold flex items-center gap-1.5">
                    {scanning ? <><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Running</> : <><CheckCircle2 className="w-4 h-4 text-safe" />Finished</>}
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                {scanning ? (
                  <Button variant="destructive" onClick={stopScan}>Stop Scan</Button>
                ) : (
                  <Button onClick={resetScan}>Done</Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function Scan() {
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["system32", "users", "appdata"]);
  const [bootScheduled, setBootScheduled] = useState(false);
  const { toast } = useToast();

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 pb-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Center</h1>
        <p className="text-muted-foreground mt-1">Check your PC for malware, rootkits, tracking cookies, and performance issues.</p>
      </div>

      <Tabs defaultValue="smart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 h-auto">
          <TabsTrigger value="smart" className="py-2.5 text-sm">Smart Scan</TabsTrigger>
          <TabsTrigger value="full" className="py-2.5 text-sm">Full Virus Scan</TabsTrigger>
          <TabsTrigger value="targeted" className="py-2.5 text-sm">Targeted Scan</TabsTrigger>
          <TabsTrigger value="boottime" className="py-2.5 text-sm">Boot-Time</TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 text-sm">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="mt-0">
          <ScanPanel paths={MOCK_PATHS} label="Smart Scan" description="Checks the most vulnerable areas of your PC for viruses, outdated software, network threats, and performance issues." estimatedTime="2–5 minutes" />
        </TabsContent>

        <TabsContent value="full" className="mt-0">
          <ScanPanel paths={FULL_PATHS} label="Full Virus Scan" description="Deep-scans every file on your hard drives, registry entries, and memory modules. Detects rootkits, advanced persistent threats, and hidden malware." estimatedTime="30–60 minutes" />
        </TabsContent>

        <TabsContent value="targeted" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-primary" /> Targeted Scan</CardTitle>
              <CardDescription>Select specific folders or drives to scan. Faster and more precise than a full scan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SCAN_TARGETS.map(target => (
                  <div key={target.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-secondary/30 ${selectedTargets.includes(target.id) ? "border-primary/40 bg-primary/5" : "border-border"}`} onClick={() => toggleTarget(target.id)}>
                    <Checkbox checked={selectedTargets.includes(target.id)} onCheckedChange={() => toggleTarget(target.id)} className="data-[state=checked]:bg-primary" data-testid={`check-target-${target.id}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">{target.label}</div>
                      <div className="text-xs text-muted-foreground">{target.size}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTargets.length > 0 && (
                <ScanPanel paths={MOCK_PATHS} label={`Targeted Scan (${selectedTargets.length} location${selectedTargets.length > 1 ? "s" : ""})`} description={`Scanning ${selectedTargets.length} selected location${selectedTargets.length > 1 ? "s" : ""} for threats.`} estimatedTime="1–15 minutes depending on selection" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boottime" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Boot-Time Scan</CardTitle>
              <CardDescription>Runs before Windows loads, removing threats that hide from normal scans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 bg-secondary/30 rounded-lg space-y-3">
                <h3 className="font-semibold">When to use Boot-Time Scan</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["You suspect a rootkit or bootkit infection", "Malware files are locked by the OS during normal operation", "Normal scans keep finding and re-finding the same threat", "System is behaving erratically with no clear cause"].map(t => (
                    <li key={t} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-warning">Takes 15–60 minutes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your computer will restart and the scan will run before Windows loads. Do not power off during the scan.</p>
                </div>
              </div>
              {bootScheduled ? (
                <div className="flex items-center justify-center gap-3 py-4 text-safe">
                  <CheckCircle2 className="w-6 h-6" />
                  <div><p className="font-bold">Boot-Time Scan Scheduled</p><p className="text-sm text-muted-foreground">Will run on next system restart.</p></div>
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={() => { setBootScheduled(true); toast({ title: "Boot-Time Scan Scheduled", description: "Scan will run automatically before Windows loads on next restart." }); }} data-testid="btn-schedule-boot">
                  <RefreshCw className="w-4 h-4 mr-2" /> Schedule Boot-Time Scan
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Scan History</CardTitle><CardDescription>Review past scan results and logs.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Scan Type</TableHead><TableHead>Duration</TableHead><TableHead>Files</TableHead><TableHead>Threats</TableHead><TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCAN_HISTORY.map(scan => (
                    <TableRow key={scan.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium text-sm">{scan.date}</TableCell>
                      <TableCell className="text-sm">{scan.type}</TableCell>
                      <TableCell className="text-sm font-mono">{scan.duration}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{scan.files}</TableCell>
                      <TableCell><span className={scan.threats > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>{scan.threats}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={scan.threats === 0 ? "text-safe border-safe/40 bg-safe/5" : "text-warning border-warning/40 bg-warning/5"}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
