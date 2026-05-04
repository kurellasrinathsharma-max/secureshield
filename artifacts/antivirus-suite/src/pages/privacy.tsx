import { useState, useRef } from "react";
import { EyeOff, AlertCircle, Search, Trash2, Camera, Lock, RefreshCw, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SENSITIVE_DOCS = [
  { name: "Tax_Return_2023.pdf", path: "C:\\Users\\Admin\\Documents", type: "Tax Document", risk: "high" },
  { name: "Passport_scan.jpg", path: "C:\\Users\\Admin\\Pictures", type: "Government ID", risk: "critical" },
  { name: "Bank_Statement_Oct.pdf", path: "C:\\Users\\Admin\\Downloads", type: "Financial Record", risk: "high" },
  { name: "Medical_Report_2024.pdf", path: "C:\\Users\\Admin\\Documents\\Health", type: "Medical Record", risk: "medium" },
  { name: "Insurance_Policy.pdf", path: "C:\\Users\\Admin\\Desktop", type: "Insurance Document", risk: "medium" },
];

const BREACH_RESULTS = [
  { service: "Canva (2019)", exposed: "Email, Password Hash, Name, Country", risk: "high" },
  { service: "LinkedIn (2021)", exposed: "Email, Phone Number, Location", risk: "medium" },
  { service: "RockYou2024 Compilation", exposed: "Password Hash", risk: "critical" },
];

const WEBCAM_APPS = [
  { name: "Zoom.exe", status: "allowed", lastUsed: "2h ago" },
  { name: "Discord.exe", status: "allowed", lastUsed: "Yesterday" },
  { name: "OBS Studio", status: "allowed", lastUsed: "3 days ago" },
  { name: "Unknown_App.exe", status: "blocked", lastUsed: "Blocked" },
  { name: "RemoteDesktop.exe", status: "blocked", lastUsed: "Blocked" },
];

type ShredFile = { name: string; size: string };

export default function Privacy() {
  const [webcamShield, setWebcamShield] = useState(true);
  const [browserShield, setBrowserShield] = useState(true);
  const [hackEmail, setHackEmail] = useState("user@example.com");
  const [checkingBreaches, setCheckingBreaches] = useState(false);
  const [breachChecked, setBreachChecked] = useState(false);
  const [scanningDocs, setScanningDocs] = useState(false);
  const [docScanProgress, setDocScanProgress] = useState(0);
  const [docsFound, setDocsFound] = useState(false);
  const [shredMethod, setShredMethod] = useState("standard");
  const [shredFiles, setShredFiles] = useState<ShredFile[]>([]);
  const [shredding, setShredding] = useState(false);
  const [shreddingFile, setShreddingFile] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const checkBreaches = () => {
    setCheckingBreaches(true);
    setBreachChecked(false);
    setTimeout(() => {
      setCheckingBreaches(false);
      setBreachChecked(true);
      toast({ title: "Breach Check Complete", description: `3 breaches found for ${hackEmail}.`, variant: "destructive" });
    }, 2000);
  };

  const scanDocuments = () => {
    setScanningDocs(true);
    setDocsFound(false);
    setDocScanProgress(0);
    const interval = setInterval(() => {
      setDocScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningDocs(false);
          setDocsFound(true);
          toast({ title: "Scan Complete", description: `${SENSITIVE_DOCS.length} sensitive documents found.`, variant: "destructive" });
          return 100;
        }
        return prev + Math.random() * 7;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` }));
    setShredFiles(prev => [...prev, ...files]);
  };

  const handleDropZoneClick = () => {
    setShredFiles(prev => [...prev, { name: `document_${Date.now()}.pdf`, size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB` }]);
    toast({ title: "File Added", description: "File queued for secure shredding." });
  };

  const shredAll = () => {
    if (shredFiles.length === 0) return;
    const files = [...shredFiles];
    let i = 0;
    const next = () => {
      if (i >= files.length) {
        setShredFiles([]);
        setShredding(false);
        setShreddingFile(null);
        toast({ title: "Shredding Complete", description: `${files.length} file${files.length > 1 ? "s" : ""} permanently destroyed.` });
        return;
      }
      setShreddingFile(files[i].name);
      setShredding(true);
      setTimeout(() => { i++; next(); }, 1200);
    };
    next();
  };

  const removeShredFile = (name: string) => setShredFiles(prev => prev.filter(f => f.name !== name));

  const riskColor = (risk: string) => {
    if (risk === "critical") return "text-destructive border-destructive";
    if (risk === "high") return "text-warning border-warning";
    return "text-muted-foreground border-muted-foreground";
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="text-muted-foreground mt-1">Protect your personal identity and sensitive data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hack Alerts */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" /> Hack Alerts
            </CardTitle>
            <CardDescription>Monitor the dark web for your compromised credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={hackEmail}
                onChange={e => setHackEmail(e.target.value)}
                placeholder="Enter email to check"
                className="bg-background/50"
                data-testid="input-hack-email"
              />
              <Button variant="destructive" onClick={checkBreaches} disabled={checkingBreaches} data-testid="btn-check-breaches">
                {checkingBreaches ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Check"}
              </Button>
            </div>
            {checkingBreaches && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Searching breach databases...
              </div>
            )}
            <AnimatePresence>
              {breachChecked && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mt-2">
                  {BREACH_RESULTS.map(breach => (
                    <div key={breach.service} className="bg-background/60 rounded-md p-3 flex items-start justify-between border border-border gap-2">
                      <div>
                        <p className="font-semibold text-sm">{breach.service}</p>
                        <p className="text-xs text-muted-foreground">Exposed: {breach.exposed}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${riskColor(breach.risk)}`}>
                        {breach.risk.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Webcam Shield */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-primary" /> Webcam Shield
                </CardTitle>
                <CardDescription className="mt-1">Block untrusted apps from accessing your camera.</CardDescription>
              </div>
              <Switch
                checked={webcamShield}
                onCheckedChange={v => { setWebcamShield(v); toast({ title: v ? "Webcam Shield On" : "Webcam Shield Off", description: v ? "All untrusted apps are now blocked from your camera." : "Camera access restrictions removed." }); }}
                className="data-[state=checked]:bg-safe"
                data-testid="switch-webcam"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {WEBCAM_APPS.map(app => (
              <div key={app.name} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${app.status === "allowed" ? "bg-safe" : "bg-destructive"}`} />
                  <div>
                    <span className="font-medium">{app.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{app.lastUsed}</span>
                  </div>
                </div>
                <Badge variant="outline" className={app.status === "allowed" ? "text-safe border-safe/40 text-xs" : "text-destructive border-destructive/40 text-xs"}>
                  {app.status === "allowed" ? "Allowed" : "Blocked"}
                </Badge>
              </div>
            ))}
            <Button variant="link" size="sm" className="px-0 mt-2 text-xs" onClick={() => toast({ title: "Permission Manager", description: "Manage all app permissions." })} data-testid="btn-manage-permissions">
              Manage all permissions...
            </Button>
          </CardContent>
        </Card>

        {/* Sensitive Data Shield */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary" /> Sensitive Data Shield
            </CardTitle>
            <CardDescription>Find and secure tax documents, medical records, and travel tickets on your PC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!docsFound && !scanningDocs && (
              <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 rounded-lg border border-dashed border-border text-center">
                <FileText className="w-10 h-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-medium">No documents protected yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Scan your PC to find tax documents, bank statements, medical files, and other sensitive data.</p>
              </div>
            )}
            {scanningDocs && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Scanning for sensitive files...</span>
                  <span>{Math.floor(docScanProgress)}%</span>
                </div>
                <Progress value={docScanProgress} className="h-2" />
              </div>
            )}
            <AnimatePresence>
              {docsFound && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="flex items-center gap-2 text-warning text-sm font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    {SENSITIVE_DOCS.length} unprotected sensitive files found
                  </div>
                  {SENSITIVE_DOCS.map(doc => (
                    <div key={doc.name} className="p-2.5 rounded-md bg-secondary/30 border border-border flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{doc.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{doc.path} — {doc.type}</div>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs" onClick={() => toast({ title: "File Protected", description: `${doc.name} has been secured.` })} data-testid={`btn-protect-${doc.name}`}>
                        Protect
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <Button className="w-full" onClick={scanDocuments} disabled={scanningDocs} data-testid="btn-scan-docs">
              {scanningDocs ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Scanning...</> : <><Search className="w-4 h-4 mr-2" /> Scan for Sensitive Documents</>}
            </Button>
          </CardContent>
        </Card>

        {/* Data Shredder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-primary" /> Data Shredder
            </CardTitle>
            <CardDescription>Permanently delete files so they can never be recovered, even by forensic tools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              ref={dropRef}
              className="p-8 border-2 border-dashed border-border rounded-lg text-center hover:bg-secondary/20 hover:border-primary/40 transition-colors cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              data-testid="shredder-dropzone"
            >
              <Trash2 className="w-8 h-8 text-muted-foreground opacity-30 mx-auto mb-2" />
              <p className="text-sm font-medium">Drop files here to shred</p>
              <p className="text-xs text-muted-foreground mt-1">or click to add a file</p>
            </div>

            {shredFiles.length > 0 && (
              <div className="space-y-2">
                {shredFiles.map(file => (
                  <div key={file.name} className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      {shreddingFile === file.name ? (
                        <RefreshCw className="w-4 h-4 text-destructive animate-spin shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{file.size}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeShredFile(file.name)} data-testid={`btn-remove-shred-${file.name}`}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shredding Algorithm</Label>
              <RadioGroup value={shredMethod} onValueChange={setShredMethod}>
                {[
                  { value: "standard", label: "Random Overwrite", desc: "1 pass (Fast)" },
                  { value: "dod", label: "DOD 5220.22-M", desc: "3 passes (Secure)" },
                  { value: "gutmann", label: "Gutmann Method", desc: "35 passes (Maximum Security)" },
                ].map(opt => (
                  <div key={opt.value} className={`flex items-center space-x-3 p-2.5 rounded-md hover:bg-secondary/30 cursor-pointer transition-colors ${shredMethod === opt.value ? "bg-secondary/30" : ""}`}>
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              disabled={shredFiles.length === 0 || shredding}
              onClick={shredAll}
              data-testid="btn-shred-all"
            >
              {shredding ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Shredding {shreddingFile}...</> : <><Trash2 className="w-4 h-4 mr-2" /> Shred {shredFiles.length} File{shredFiles.length !== 1 ? "s" : ""}</>}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
