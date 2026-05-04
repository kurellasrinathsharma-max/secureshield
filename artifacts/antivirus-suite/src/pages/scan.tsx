import { useState, useEffect, useRef } from "react";
import { Search, Bug, HardDrive, Shield, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
];

const SCAN_HISTORY = [
  { id: 1, date: "Today, 10:23 AM", type: "Smart Scan", duration: "2m 14s", threats: 0, status: "Clean" },
  { id: 2, date: "Yesterday, 08:00 PM", type: "Full Scan", duration: "45m 30s", threats: 2, status: "Resolved" },
  { id: 3, date: "Oct 12, 14:15 PM", type: "Targeted Scan", duration: "0m 45s", threats: 0, status: "Clean" },
  { id: 4, date: "Oct 10, 09:00 AM", type: "Boot-Time Scan", duration: "15m 20s", threats: 0, status: "Clean" },
];

export default function Scan() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState("");
  const [scannedFiles, setScannedFiles] = useState(0);
  const [threats, setThreats] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const pathRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setScannedFiles(0);
    setThreats(0);
    setElapsedTime(0);
    
    toast({
      title: "Scan Started",
      description: "Smart scan is now analyzing your system.",
    });

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          stopScan(true);
          return 100;
        }
        // Random progress jump
        return prev + Math.random() * 2;
      });
      setScannedFiles(prev => prev + Math.floor(Math.random() * 150) + 50);
      
      // Simulate finding a threat rarely
      if (Math.random() > 0.98) {
        setThreats(prev => prev + 1);
      }
    }, 200);

    pathRef.current = setInterval(() => {
      setCurrentPath(MOCK_PATHS[Math.floor(Math.random() * MOCK_PATHS.length)]);
    }, 150);
  };

  const stopScan = (completed = false) => {
    setScanning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (pathRef.current) clearInterval(pathRef.current);
    
    if (completed) {
      toast({
        title: "Scan Complete",
        description: `Scanned ${scannedFiles.toLocaleString()} files. ${threats} threats found.`,
        variant: threats > 0 ? "destructive" : "default",
      });
    } else {
      toast({
        title: "Scan Aborted",
        description: "The scan was cancelled by the user.",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      if (pathRef.current) clearInterval(pathRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Center</h1>
        <p className="text-muted-foreground mt-1">Check your PC for malware, tracking cookies, and performance issues.</p>
      </div>

      <Tabs defaultValue="smart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 h-auto">
          <TabsTrigger value="smart" className="py-3">Smart Scan</TabsTrigger>
          <TabsTrigger value="full" className="py-3">Full Virus Scan</TabsTrigger>
          <TabsTrigger value="targeted" className="py-3">Targeted Scan</TabsTrigger>
          <TabsTrigger value="custom" className="py-3">Custom Scan</TabsTrigger>
          <TabsTrigger value="history" className="py-3">Scan History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="smart" className="mt-0">
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {!scanning && progress === 0 ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
                      <Search className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                      Smart Scan checks for viruses, outdated software, network threats, and performance issues in one go.
                    </p>
                    <Button size="lg" className="w-48 text-lg h-14 rounded-full shadow-lg shadow-primary/25" onClick={startScan}>
                      Start Scan
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold">{progress >= 100 ? "Scan Complete" : "Scanning..."}</h2>
                        <p className="text-sm font-mono text-muted-foreground mt-2 truncate w-64 md:w-96">
                          {progress >= 100 ? "Done." : currentPath}
                        </p>
                      </div>
                      <div className="text-4xl font-bold font-mono text-primary">
                        {Math.min(100, Math.floor(progress))}%
                      </div>
                    </div>

                    <div className="relative">
                      <Progress value={progress} className="h-4" />
                      {scanning && (
                        <div 
                          className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                          style={{ left: `${progress}%`, transform: 'translateX(-100%)' }}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Files Scanned</div>
                        <div className="text-2xl font-bold font-mono">{scannedFiles.toLocaleString()}</div>
                      </div>
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Threats Found</div>
                        <div className={`text-2xl font-bold font-mono ${threats > 0 ? 'text-destructive' : 'text-safe'}`}>
                          {threats}
                        </div>
                      </div>
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Elapsed Time</div>
                        <div className="text-2xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                      </div>
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Status</div>
                        <div className="text-lg font-bold flex items-center">
                          {scanning ? (
                            <><span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" /> Running</>
                          ) : (
                            <><CheckCircle2 className="w-5 h-5 text-safe mr-2" /> Finished</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      {scanning ? (
                        <Button variant="destructive" onClick={() => stopScan(false)}>
                          Stop Scan
                        </Button>
                      ) : (
                        <Button onClick={() => { setProgress(0); }}>
                          Done
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Full Virus Scan</CardTitle>
              <CardDescription>Deeply scan your entire system. This may take a while.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 py-6">
                <HardDrive className="w-16 h-16 text-muted-foreground opacity-50" />
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Checks every file on your hard drives, registry, and memory for hidden malware, rootkits, and advanced threats.</p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="smart"]')?.click()}>Start Full Scan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Review past scan results and logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Scan Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Threats</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCAN_HISTORY.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium">{scan.date}</TableCell>
                      <TableCell>{scan.type}</TableCell>
                      <TableCell>{scan.duration}</TableCell>
                      <TableCell>
                        <span className={scan.threats > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                          {scan.threats}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scan.threats > 0 ? "destructive" : "secondary"} className={scan.threats === 0 ? "bg-safe/20 text-safe hover:bg-safe/30 border-none" : ""}>
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
        
        <TabsContent value="targeted" className="mt-0"><Card><CardContent className="p-8 text-center text-muted-foreground">Select specific folders or drives to scan.</CardContent></Card></TabsContent>
        <TabsContent value="custom" className="mt-0"><Card><CardContent className="p-8 text-center text-muted-foreground">Create custom scan profiles with specific parameters.</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
